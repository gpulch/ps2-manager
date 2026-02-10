use std::path::{Path, PathBuf};
use regex::Regex;

const MAX_FILE_SIZE: u64 = 10_737_418_240; // 10 GB max
const MIN_FILE_SIZE: u64 = 1_048_576; // 1 MB min (ISO files)
const MAX_URL_LENGTH: usize = 2048;

// Whitelist of allowed domains (static to avoid reallocation)
const ALLOWED_DOMAINS: &[&str] = &[
  "archive.org",
  // Archive.org CDN ranges
  "ia601", "ia602", "ia603", "ia604", "ia605", "ia606", "ia607", "ia608", "ia609",
  "ia800", "ia801", "ia802", "ia803", "ia804", "ia805", "ia806", "ia807", "ia808", "ia809",
  "ia900", "ia901", "ia902", "ia903", "ia904", "ia905", "ia906", "ia907", "ia908", "ia909",
];

/// Validates that a URL is safe for downloading
pub fn validate_download_url(url: &str) -> Result<(), String> {
  // Must be HTTPS for security
  if !url.starts_with("https://") {
    return Err("Only HTTPS URLs are allowed for downloads".into());
  }

  // Check URL length
  if url.len() > MAX_URL_LENGTH {
    return Err(format!("URL is too long (max {} characters)", MAX_URL_LENGTH).into());
  }

  // Parse URL (single parse, reuse result)
  let parsed_url = url::Url::parse(url).map_err(|_| "Invalid URL format")?;
  let host = parsed_url.host_str().ok_or("URL has no host")?;

  // Check against whitelist
  let is_allowed = ALLOWED_DOMAINS.iter().any(|&domain| {
    host == domain || host.ends_with(&format!(".{}", domain))
  });

  if !is_allowed {
    return Err(format!(
      "Domain '{}' is not in the whitelist of allowed download sources. Only archive.org is currently supported.",
      host
    ));
  }

  Ok(())
}

/// Sanitizes a filename to prevent path traversal and malicious names
pub fn sanitize_filename(name: &str) -> Result<String, String> {
  const MAX_FILENAME_LENGTH: usize = 255;

  if name.is_empty() {
    return Err("Filename cannot be empty".into());
  }

  if name.len() > MAX_FILENAME_LENGTH {
    return Err(format!("Filename is too long (max {} characters)", MAX_FILENAME_LENGTH).into());
  }

  // Chain replacements for efficiency
  let cleaned = name
    .replace('/', "_")
    .replace('\\', "_")
    .replace("..", "_")
    .replace('\0', "")
    .chars()
    .filter(|c| !c.is_control())
    .collect::<String>();

  // Check for hidden files
  if cleaned.starts_with('.') {
    return Err("Hidden files are not allowed".into());
  }

  // Validate extension
  let lower = cleaned.to_lowercase();
  if !lower.ends_with(".iso") {
    return Err("Only .iso files are allowed".into());
  }

  // Validate characters - allow alphanumeric, spaces, common punctuation
  // Allows: letters, numbers, spaces, hyphens, underscores, dots, parentheses, ampersands, apostrophes, exclamation marks
  let re = Regex::new(r"^[\w\s\-\.\(\)\&\'\!\,\+\[\]]+\.iso$").unwrap();
  if !re.is_match(&lower) {
    return Err("Filename contains invalid characters".into());
  }

  Ok(cleaned)
}

/// Validates that a path is within an allowed directory (prevents path traversal)
pub fn validate_safe_path(base_dir: &Path, target_path: &Path) -> Result<(), String> {
  // Canonicalize paths to resolve any .. or symlinks
  let base = base_dir.canonicalize().map_err(|e| format!("Invalid base directory: {}", e))?;
  
  let target = if target_path.exists() {
    target_path.canonicalize().map_err(|e| format!("Invalid target path: {}", e))?
  } else {
    // If file doesn't exist yet, check parent directory
    let parent = target_path.parent().ok_or("Invalid target path")?;
    let parent_canonical = parent.canonicalize().map_err(|e| format!("Invalid parent directory: {}", e))?;
    parent_canonical.join(target_path.file_name().ok_or("Invalid filename")?)
  };

  // Ensure target is within base directory
  if !target.starts_with(&base) {
    return Err("Path traversal detected: target is outside allowed directory".into());
  }

  Ok(())
}

/// Validates file size is within acceptable limits
pub fn validate_file_size(size: u64) -> Result<(), String> {
  if size < MIN_FILE_SIZE {
    return Err(format!(
      "File is too small ({} bytes). Minimum size is {} MB for ISO files.",
      size,
      MIN_FILE_SIZE / 1_048_576
    ));
  }

  if size > MAX_FILE_SIZE {
    return Err(format!(
      "File is too large ({} bytes). Maximum size is {} GB.",
      size,
      MAX_FILE_SIZE / 1_073_741_824
    ));
  }

  Ok(())
}

/// Validates Content-Type header for downloads
pub fn validate_content_type(content_type: &str) -> Result<(), String> {
  let allowed_types = vec![
    "application/octet-stream",
    "application/x-iso9660-image",
    "application/x-cd-image",
    "application/x-compressed-iso",
  ];

  let content_type_lower = content_type.to_lowercase();
  
  let is_allowed = allowed_types.iter().any(|&t| content_type_lower.contains(t));

  if !is_allowed {
    return Err(format!(
      "Invalid content type: '{}'. Expected ISO image type.",
      content_type
    ));
  }

  Ok(())
}

/// Sanitizes error messages to avoid exposing system paths
pub fn sanitize_error_message(error: &str) -> String {
  // Patterns for common system paths
  const PATH_PATTERNS: &[&str] = &[
    r"/Users/[^/\s]+",
    r"/home/[^/\s]+",
    r"C:\\Users\\[^\\]+",
    r"C:\\Documents and Settings\\[^\\]+",
  ];

  let mut sanitized = error.to_string();

  // Apply all replacements
  for pattern in PATH_PATTERNS {
    if let Ok(re) = Regex::new(pattern) {
      sanitized = re.replace_all(&sanitized, "[USER]").into_owned();
    }
  }

  sanitized
}

/// Generates a safe download path
pub fn generate_safe_download_path(
  base_dir: &Path,
  filename: &str,
) -> Result<PathBuf, String> {
  // Sanitize filename first
  let safe_filename = sanitize_filename(filename)?;

  // Create full path
  let target_path = base_dir.join(&safe_filename);

  // Validate it's within base directory (path traversal check)
  validate_safe_path(base_dir, &target_path)?;

  Ok(target_path)
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_validate_https_only() {
    assert!(validate_download_url("http://archive.org/file.iso").is_err());
    assert!(validate_download_url("https://archive.org/file.iso").is_ok());
  }

  #[test]
  fn test_sanitize_filename() {
    assert!(sanitize_filename("game.iso").is_ok());
    assert!(sanitize_filename("../../../etc/passwd").is_err());
    assert!(sanitize_filename("game/../other.iso").is_ok()); // Gets sanitized
    assert!(sanitize_filename(".hidden.iso").is_err());
    assert!(sanitize_filename("game.exe").is_err());
  }

  #[test]
  fn test_file_size_limits() {
    assert!(validate_file_size(500_000).is_err()); // Too small
    assert!(validate_file_size(700_000_000).is_ok()); // Valid CD
    assert!(validate_file_size(4_700_000_000).is_ok()); // Valid DVD
    assert!(validate_file_size(20_000_000_000).is_err()); // Too large
  }
}
