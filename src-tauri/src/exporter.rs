use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub fn export_catalog_json(dest_path: String, json: String) -> Result<String, String> {
  let dest = PathBuf::from(&dest_path);
  if let Some(parent) = dest.parent() { fs::create_dir_all(parent).map_err(|e| e.to_string())?; }
  fs::write(&dest, json.as_bytes()).map_err(|e| e.to_string())?;
  Ok(dest.to_string_lossy().to_string())
}
