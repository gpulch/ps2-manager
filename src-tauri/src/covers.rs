use std::fs::{self, File};
use std::io::Cursor;
use std::path::PathBuf;

use image::ImageFormat;

#[tauri::command]
pub fn save_cover_from_url(opl_root: String, game_id: String, url: String) -> Result<String, String> {
  let id = game_id.trim().to_uppercase();
  if id.is_empty() { return Err("missing id".into()); }
  let art_dir = PathBuf::from(&opl_root).join("ART");
  if let Err(e) = fs::create_dir_all(&art_dir) { return Err(e.to_string()); }
  let resp = reqwest::blocking::get(&url).map_err(|e| e.to_string())?;
  if !resp.status().is_success() { return Err(format!("http {}", resp.status())); }
  let bytes = resp.bytes().map_err(|e| e.to_string())?;
  let img = image::load_from_memory(&bytes).map_err(|e| e.to_string())?;
  let dest = art_dir.join(format!("{}.png", id));
  let mut file = File::create(&dest).map_err(|e| e.to_string())?;
  img.write_to(&mut file, ImageFormat::Png).map_err(|e| e.to_string())?;
  Ok(dest.to_string_lossy().to_string())
}

#[tauri::command]
pub fn save_cover_from_file(opl_root: String, game_id: String, src_path: String) -> Result<String, String> {
  let id = game_id.trim().to_uppercase();
  if id.is_empty() { return Err("missing id".into()); }
  let art_dir = PathBuf::from(&opl_root).join("ART");
  if let Err(e) = fs::create_dir_all(&art_dir) { return Err(e.to_string()); }
  let data = fs::read(&src_path).map_err(|e| e.to_string())?;
  let img = image::load_from_memory(&data).map_err(|e| e.to_string())?;
  let dest = art_dir.join(format!("{}.png", id));
  let mut buf = Cursor::new(Vec::<u8>::new());
  img.write_to(&mut buf, ImageFormat::Png).map_err(|e| e.to_string())?;
  fs::write(&dest, buf.into_inner()).map_err(|e| e.to_string())?;
  Ok(dest.to_string_lossy().to_string())
}

#[tauri::command]
pub fn delete_cover(opl_root: String, game_id: String) -> Result<bool, String> {
  let id = game_id.trim().to_uppercase();
  if id.is_empty() { return Err("missing id".into()); }
  let path = PathBuf::from(&opl_root).join("ART").join(format!("{}.png", id));
  match fs::remove_file(&path) {
    Ok(_) => Ok(true),
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(false),
    Err(e) => Err(e.to_string()),
  }
}
