use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::PathBuf;
use reqwest::blocking::Client;
use tauri::Emitter;
use crate::security;

#[allow(dead_code)] // Reserved for future multi-source support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteSource {
  pub name: String,
  pub url: String,
  pub source_type: String, // "archive_org", "http", etc.
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteGame {
  pub name: String,
  pub download_url: String,
  pub size: Option<u64>,
  pub format: String, // "iso", "zip", etc.
}

#[derive(Debug, Clone, Serialize)]
pub struct DownloadProgress {
  pub downloaded: u64,
  pub total: u64,
  pub percent: f64,
  pub status: String,
}

/// Parse Archive.org collection page
#[tauri::command]
pub fn fetch_archive_org_games(collection_url: String) -> Result<Vec<RemoteGame>, String> {
  // Security: Validate URL before fetching
  security::validate_download_url(&collection_url)?;
  // Extract collection ID from URL
  let collection_id = collection_url
    .split('/')
    .last()
    .ok_or("Invalid collection URL")?;

  // Archive.org API endpoint
  let api_url = format!(
    "https://archive.org/metadata/{}",
    collection_id
  );

  let client = Client::builder()
    .timeout(std::time::Duration::from_secs(30))
    .build()
    .map_err(|e| e.to_string())?;

  let response = client
    .get(&api_url)
    .send()
    .map_err(|e| e.to_string())?;

  if !response.status().is_success() {
    return Err(format!("Failed to fetch collection: {}", response.status()));
  }

  let text = response.text().map_err(|e| e.to_string())?;
  let json: serde_json::Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;

  let mut games = Vec::new();

  if let Some(files) = json["files"].as_array() {
    for file in files {
      let name = file["name"].as_str().unwrap_or("");
      let format = file["format"].as_str().unwrap_or("");

      // Filter for ISO files
      if format.to_lowercase() == "iso" || name.to_lowercase().ends_with(".iso") {
        let size = file["size"].as_str().and_then(|s| s.parse::<u64>().ok());
        
        games.push(RemoteGame {
          name: name.to_string(),
          download_url: format!(
            "https://archive.org/download/{}/{}",
            collection_id, name
          ),
          size,
          format: "iso".to_string(),
        });
      }
    }
  }

  Ok(games)
}

/// Download a remote ISO file to the library folder
#[tauri::command]
pub fn download_remote_iso(
  download_url: String,
  destination_folder: String,
  file_name: String,
) -> Result<String, String> {
  let dest_path = PathBuf::from(&destination_folder);
  
  // Validate destination
  if !dest_path.exists() {
    return Err("Destination folder does not exist".into());
  }

  let file_path = dest_path.join(&file_name);
  
  // Check if file already exists
  if file_path.exists() {
    return Err(format!("File already exists: {}", file_name));
  }

  let client = Client::builder()
    .timeout(std::time::Duration::from_secs(3600)) // 1 hour timeout for large files
    .build()
    .map_err(|e| e.to_string())?;

  let mut response = client
    .get(&download_url)
    .send()
    .map_err(|e| e.to_string())?;

  if !response.status().is_success() {
    return Err(format!("Download failed: {}", response.status()));
  }

  let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
  
  // Write downloaded content
  response
    .copy_to(&mut file)
    .map_err(|e| e.to_string())?;

  Ok(file_path.to_string_lossy().to_string())
}

/// Download with progress tracking (chunked download)
/// Runs in separate thread to avoid blocking UI
#[tauri::command]
pub async fn download_remote_iso_with_progress(
  download_url: String,
  destination_folder: String,
  file_name: String,
  window: tauri::Window,
) -> Result<String, String> {
  // Spawn blocking task to avoid freezing UI
  tokio::task::spawn_blocking(move || {
    download_remote_iso_blocking(download_url, destination_folder, file_name, window)
  })
  .await
  .map_err(|e| e.to_string())?
}

/// Blocking download implementation
fn download_remote_iso_blocking(
  download_url: String,
  destination_folder: String,
  file_name: String,
  window: tauri::Window,
) -> Result<String, String> {
  // Security: Validate download URL (HTTPS only, whitelist domains)
  security::validate_download_url(&download_url)?;
  
  // Security: Sanitize filename (prevent path traversal, malicious names)
  let safe_filename = security::sanitize_filename(&file_name)?;
  
  let dest_path = PathBuf::from(&destination_folder);
  
  if !dest_path.exists() {
    fs::create_dir_all(&dest_path).map_err(|e| e.to_string())?;
  }

  // Security: Generate safe path and validate it's within allowed directory
  let file_path = security::generate_safe_download_path(&dest_path, &safe_filename)?;
  
  // Check if file already exists and validate it
  if file_path.exists() {
    // Check if it's a complete file by comparing with expected size from a previous download
    // For now, just warn that file exists
    return Err(format!("File already exists: {}. Delete it first if you want to re-download.", file_name));
  }

  let client = Client::builder()
    .timeout(std::time::Duration::from_secs(3600))
    .build()
    .map_err(|e| e.to_string())?;

  let mut response = client
    .get(&download_url)
    .send()
    .map_err(|e| e.to_string())?;

  if !response.status().is_success() {
    return Err(format!("Download failed: {}", response.status()));
  }

  let total_size = response.content_length().unwrap_or(0);
  
  // Validation: Check if content-length is available
  if total_size == 0 {
    return Err("Server did not provide file size (Content-Length missing)".into());
  }
  
  // Security: Validate file size is within acceptable limits (1 MB - 10 GB)
  security::validate_file_size(total_size)?;
  
  // Security: Validate Content-Type if provided
  if let Some(content_type) = response.headers().get("content-type") {
    if let Ok(ct_str) = content_type.to_str() {
      // Only warn, don't block (some servers don't set correct content-type)
      if let Err(e) = security::validate_content_type(ct_str) {
        eprintln!("Warning: {}", e);
      }
    }
  }
  
  let mut downloaded: u64 = 0;
  let mut file = File::create(&file_path).map_err(|e| e.to_string())?;

  // Throttle progress updates - emit only every 1MB to avoid UI flooding
  let progress_threshold = 1_048_576; // 1 MB
  let mut last_progress_emit = 0u64;

  let mut buffer = [0; 65536]; // Larger buffer for better performance (64KB)
  loop {
    match response.read(&mut buffer) {
      Ok(0) => break, // EOF
      Ok(n) => {
        file.write_all(&buffer[..n]).map_err(|e| e.to_string())?;
        downloaded += n as u64;

        // Emit progress event only every ~1MB or at completion
        if downloaded - last_progress_emit >= progress_threshold || downloaded == total_size {
          last_progress_emit = downloaded;
          
          let percent = if total_size > 0 {
            (downloaded as f64 / total_size as f64) * 100.0
          } else {
            0.0
          };

          let progress = DownloadProgress {
            downloaded,
            total: total_size,
            percent,
            status: "downloading".to_string(),
          };

          let _ = window.emit("download-progress", &progress);
        }
      }
      Err(e) => {
        // Download interrupted - cleanup incomplete file
        let _ = fs::remove_file(&file_path);
        
        // Emit failed status
        let _ = window.emit("download-progress", &DownloadProgress {
          downloaded,
          total: total_size,
          percent: (downloaded as f64 / total_size as f64 * 100.0),
          status: "failed".to_string(),
        });
        
        // Security: Sanitize error message to avoid exposing system paths
        let safe_error = security::sanitize_error_message(&e.to_string());
        
        return Err(format!("Download interrupted at {}%: {}. Incomplete file has been removed.", 
          (downloaded as f64 / total_size as f64 * 100.0) as u64,
          safe_error
        ));
      }
    }
  }

  // Validation: Verify download is complete
  if downloaded < total_size {
    let _ = fs::remove_file(&file_path);
    return Err(format!(
      "Download incomplete: got {} bytes, expected {} bytes ({}% complete). File has been removed.",
      downloaded,
      total_size,
      (downloaded as f64 / total_size as f64 * 100.0) as u64
    ));
  }

  // Double-check: Verify file size on disk
  match fs::metadata(&file_path) {
    Ok(metadata) => {
      let file_size = metadata.len();
      if file_size != total_size {
        let _ = fs::remove_file(&file_path);
        return Err(format!(
          "File size mismatch: file on disk is {} bytes, expected {} bytes. File has been removed.",
          file_size,
          total_size
        ));
      }
    }
    Err(e) => {
      let _ = fs::remove_file(&file_path);
      return Err(format!("Failed to verify file: {}. File has been removed.", e));
    }
  }

  // All validations passed - emit completion
  let _ = window.emit("download-progress", &DownloadProgress {
    downloaded: total_size,
    total: total_size,
    percent: 100.0,
    status: "completed".to_string(),
  });

  Ok(file_path.to_string_lossy().to_string())
}

/// Validate a remote source URL
#[tauri::command]
pub fn validate_remote_source(url: String) -> Result<bool, String> {
  // Security: Validate URL first
  security::validate_download_url(&url)?;
  
  let client = Client::builder()
    .timeout(std::time::Duration::from_secs(10))
    .build()
    .map_err(|e| e.to_string())?;

  let response = client
    .head(&url)
    .send()
    .map_err(|e| e.to_string())?;

  Ok(response.status().is_success())
}

/// Get security information (whitelist, limits, etc.)
#[tauri::command]
pub fn get_security_info() -> serde_json::Value {
  serde_json::json!({
    "allowed_domains": ["archive.org"],
    "https_only": true,
    "max_file_size_gb": 10,
    "min_file_size_mb": 1,
    "allowed_extensions": [".iso"],
    "path_traversal_protection": true,
    "filename_sanitization": true
  })
}
