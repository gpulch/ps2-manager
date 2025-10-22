use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub fn load_cht(opl_root: String, game_id: String) -> Result<String, String> {
  let id = game_id.trim().to_uppercase();
  if id.is_empty() { return Err("missing id".into()); }
  let path = PathBuf::from(&opl_root).join("CHT").join(format!("{}.cht", id));
  match fs::read_to_string(&path) {
    Ok(s) => Ok(s),
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(String::new()),
    Err(e) => Err(e.to_string()),
  }
}

#[tauri::command]
pub fn save_cht(opl_root: String, game_id: String, content: String) -> Result<String, String> {
  let id = game_id.trim().to_uppercase();
  if id.is_empty() { return Err("missing id".into()); }
  let dir = PathBuf::from(&opl_root).join("CHT");
  if let Err(e) = fs::create_dir_all(&dir) { return Err(e.to_string()); }
  let path = dir.join(format!("{}.cht", id));
  fs::write(&path, content).map_err(|e| e.to_string())?;
  Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn import_cht(opl_root: String, maybe_game_id: Option<String>, src_path: String) -> Result<String, String> {
  let dir = PathBuf::from(&opl_root).join("CHT");
  fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
  let id = if let Some(g) = maybe_game_id { g.trim().to_uppercase() } else { String::new() };
  let base = if !id.is_empty() { format!("{}.cht", id) } else {
    PathBuf::from(&src_path)
      .file_name()
      .map(|s| s.to_string_lossy().to_string())
      .unwrap_or_else(|| "import.cht".to_string())
  };
  let dest = dir.join(base);
  fs::copy(&src_path, &dest).map_err(|e| e.to_string())?;
  Ok(dest.to_string_lossy().to_string())
}

#[tauri::command]
pub fn export_cht(opl_root: String, game_id: String, dest_path: String) -> Result<String, String> {
  let id = game_id.trim().to_uppercase();
  if id.is_empty() { return Err("missing id".into()); }
  let src = PathBuf::from(&opl_root).join("CHT").join(format!("{}.cht", id));
  if !src.exists() { return Err("cheat file not found".into()); }
  let dest = PathBuf::from(&dest_path);
  if let Some(parent) = dest.parent() { fs::create_dir_all(parent).map_err(|e| e.to_string())?; }
  fs::copy(&src, &dest).map_err(|e| e.to_string())?;
  Ok(dest.to_string_lossy().to_string())
}
