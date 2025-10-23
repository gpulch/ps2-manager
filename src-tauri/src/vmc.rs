use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize)]
pub struct VmcInfo {
  pub file_name: String,
  pub path: String,
  pub size: u64,
  pub modified: u64,
}

fn to_epoch(t: SystemTime) -> u64 {
  t.duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0)
}

#[tauri::command]
pub fn list_vmcs(opl_root: String) -> Vec<VmcInfo> {
  let directory = PathBuf::from(&opl_root).join("VMC");
  let mut result = Vec::new();
  if let Ok(read_directory) = fs::read_dir(directory) {
    for entry in read_directory.flatten() {
      let path = entry.path();
      if path.is_file() {
        let metadata = match fs::metadata(&path) { Ok(m) => m, Err(_) => continue };
        let file_name = path.file_name().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
        let path_string = path.to_string_lossy().to_string();
        let size = metadata.len();
        let modified = metadata.modified().ok().map(to_epoch).unwrap_or(0);
        result.push(VmcInfo { file_name, path: path_string, size, modified });
      }
    }
  }
  result
}

#[tauri::command]
pub fn import_vmc(opl_root: String, source_path: String) -> Result<String, String> {
  let source = PathBuf::from(&source_path);
  if !source.is_file() { return Err("invalid source".into()); }
  let destination_directory = PathBuf::from(&opl_root).join("VMC");
  fs::create_dir_all(&destination_directory).map_err(|error| error.to_string())?;
  let base_filename = source.file_name().ok_or_else(|| "bad name".to_string())?.to_string_lossy().to_string();
  let mut candidate = destination_directory.join(&base_filename);
  if candidate.exists() {
    let file_stem = source.file_stem().and_then(|s| s.to_str()).unwrap_or("vmc").to_string();
    let extension = source.extension().and_then(|s| s.to_str()).unwrap_or("");
    let mut counter = 1u32;
    loop {
      let name = if extension.is_empty() { format!("{} ({})", file_stem, counter) } else { format!("{} ({}).{}", file_stem, counter, extension) };
      candidate = destination_directory.join(&name);
      if !candidate.exists() { break; }
      counter += 1;
    }
  }
  fs::copy(&source, &candidate).map_err(|error| error.to_string())?;
  Ok(candidate.to_string_lossy().to_string())
}

#[tauri::command]
pub fn export_vmc(opl_root: String, file_name: String, destination_path: String) -> Result<String, String> {
  let source = PathBuf::from(&opl_root).join("VMC").join(&file_name);
  if !source.is_file() { return Err("source not found".into()); }
  let destination = PathBuf::from(&destination_path);
  if let Some(parent) = destination.parent() { fs::create_dir_all(parent).map_err(|error| error.to_string())?; }
  fs::copy(&source, &destination).map_err(|error| error.to_string())?;
  Ok(destination.to_string_lossy().to_string())
}

#[tauri::command]
pub fn delete_vmc(opl_root: String, file_name: String) -> Result<bool, String> {
  let path = PathBuf::from(&opl_root).join("VMC").join(&file_name);
  match fs::remove_file(&path) {
    Ok(_) => Ok(true),
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(false),
    Err(e) => Err(e.to_string()),
  }
}
