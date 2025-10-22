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
  let dir = PathBuf::from(&opl_root).join("VMC");
  let mut res = Vec::new();
  if let Ok(rd) = fs::read_dir(dir) {
    for e in rd.flatten() {
      let p = e.path();
      if p.is_file() {
        let meta = match fs::metadata(&p) { Ok(m) => m, Err(_) => continue };
        let file_name = p.file_name().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
        let path = p.to_string_lossy().to_string();
        let size = meta.len();
        let modified = meta.modified().ok().map(to_epoch).unwrap_or(0);
        res.push(VmcInfo { file_name, path, size, modified });
      }
    }
  }
  res
}

#[tauri::command]
pub fn import_vmc(opl_root: String, src_path: String) -> Result<String, String> {
  let src = PathBuf::from(&src_path);
  if !src.is_file() { return Err("invalid source".into()); }
  let dest_dir = PathBuf::from(&opl_root).join("VMC");
  fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;
  let base = src.file_name().ok_or_else(|| "bad name".to_string())?.to_string_lossy().to_string();
  let mut candidate = dest_dir.join(&base);
  if candidate.exists() {
    let stem = src.file_stem().and_then(|s| s.to_str()).unwrap_or("vmc").to_string();
    let ext = src.extension().and_then(|s| s.to_str()).unwrap_or("");
    let mut i = 1u32;
    loop {
      let name = if ext.is_empty() { format!("{} ({})", stem, i) } else { format!("{} ({}).{}", stem, i, ext) };
      candidate = dest_dir.join(name);
      if !candidate.exists() { break; }
      i += 1;
    }
  }
  fs::copy(&src, &candidate).map_err(|e| e.to_string())?;
  Ok(candidate.to_string_lossy().to_string())
}

#[tauri::command]
pub fn export_vmc(opl_root: String, file_name: String, dest_path: String) -> Result<String, String> {
  let src = PathBuf::from(&opl_root).join("VMC").join(&file_name);
  if !src.is_file() { return Err("source not found".into()); }
  let dest = PathBuf::from(&dest_path);
  if let Some(parent) = dest.parent() { fs::create_dir_all(parent).map_err(|e| e.to_string())?; }
  fs::copy(&src, &dest).map_err(|e| e.to_string())?;
  Ok(dest.to_string_lossy().to_string())
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
