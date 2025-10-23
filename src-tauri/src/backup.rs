use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupMetadata {
  pub created_at: String,
  pub app_version: String,
  pub library_path: String,
  pub game_count: usize,
  pub total_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupData {
  pub metadata: BackupMetadata,
  pub games: Vec<crate::scanner::GameInfo>,
  pub settings: serde_json::Value,
}

/// Creates a backup of the catalog and settings
#[tauri::command]
pub fn create_backup(
  library_path: String,
  settings: serde_json::Value,
) -> Result<BackupData, String> {
  let games = crate::scanner::scan_folder_games(library_path.clone());
  
  let total_size: u64 = games.iter().map(|g| g.size).sum();
  let created_at: DateTime<Utc> = Utc::now();
  
  let metadata = BackupMetadata {
    created_at: created_at.to_rfc3339(),
    app_version: env!("CARGO_PKG_VERSION").to_string(),
    library_path,
    game_count: games.len(),
    total_size_bytes: total_size,
  };
  
  Ok(BackupData {
    metadata,
    games,
    settings,
  })
}

/// Saves backup to a file
#[tauri::command]
pub fn save_backup_to_file(
  backup: BackupData,
  destination_path: String,
) -> Result<String, String> {
  let json = serde_json::to_string_pretty(&backup)
    .map_err(|error| format!("Failed to serialize backup: {}", error))?;
  
  let destination = PathBuf::from(&destination_path);
  
  // Create parent directory if needed
  if let Some(parent) = destination.parent() {
    fs::create_dir_all(parent).map_err(|error| error.to_string())?;
  }
  
  fs::write(&destination, json).map_err(|error| error.to_string())?;
  
  Ok(destination.to_string_lossy().to_string())
}

/// Loads backup from a file
#[tauri::command]
pub fn load_backup_from_file(source_path: String) -> Result<BackupData, String> {
  let source = PathBuf::from(&source_path);
  
  if !source.is_file() {
    return Err("Backup file not found".into());
  }
  
  let contents = fs::read_to_string(&source).map_err(|error| error.to_string())?;
  
  let backup: BackupData = serde_json::from_str(&contents)
    .map_err(|error| format!("Invalid backup file format: {}", error))?;
  
  Ok(backup)
}

/// Validates a backup file
#[tauri::command]
pub fn validate_backup(source_path: String) -> Result<BackupMetadata, String> {
  let backup = load_backup_from_file(source_path)?;
  Ok(backup.metadata)
}

/// Gets quick backup statistics without loading full backup
#[tauri::command]
pub fn get_backup_info(source_path: String) -> Result<serde_json::Value, String> {
  let backup = load_backup_from_file(source_path)?;
  
  Ok(serde_json::json!({
    "created_at": backup.metadata.created_at,
    "app_version": backup.metadata.app_version,
    "library_path": backup.metadata.library_path,
    "game_count": backup.metadata.game_count,
    "total_size_bytes": backup.metadata.total_size_bytes,
    "total_size_gb": backup.metadata.total_size_bytes as f64 / 1_073_741_824.0,
  }))
}
