use std::fs;
use std::path::Path;

/// Validates if a file is complete by checking its size matches expected size
pub fn validate_file_size(file_path: &Path, expected_size: u64) -> Result<bool, String> {
  match fs::metadata(file_path) {
    Ok(metadata) => {
      let actual_size = metadata.len();
      Ok(actual_size == expected_size)
    }
    Err(e) => Err(format!("Failed to read file metadata: {}", e)),
  }
}

/// Cleans up incomplete downloads in a directory
pub fn cleanup_incomplete_downloads(directory: &Path, extensions: &[&str]) -> Result<Vec<String>, String> {
  let mut cleaned_files = Vec::new();
  
  if !directory.is_dir() {
    return Ok(cleaned_files);
  }

  match fs::read_dir(directory) {
    Ok(entries) => {
      for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() {
          if let Some(ext) = path.extension() {
            if extensions.iter().any(|&e| e == ext.to_string_lossy().as_ref()) {
              // Check if file size is suspiciously small (< 100MB for ISO)
              if let Ok(metadata) = fs::metadata(&path) {
                let size = metadata.len();
                // ISO files are typically > 700MB, if smaller it's likely incomplete
                if size < 100_000_000 { // 100 MB
                  if let Err(_) = fs::remove_file(&path) {
                    // Failed to remove, skip
                  } else {
                    if let Some(name) = path.file_name() {
                      cleaned_files.push(name.to_string_lossy().to_string());
                    }
                  }
                }
              }
            }
          }
        }
      }
      Ok(cleaned_files)
    }
    Err(e) => Err(format!("Failed to read directory: {}", e)),
  }
}
