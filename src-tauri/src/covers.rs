use std::fs::{self, File};
use std::io::Cursor;
use std::path::PathBuf;

use image::ImageFormat;
use serde::Deserialize;

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
  let destination = art_dir.join(format!("{}.png", id));
  let mut file = File::create(&destination).map_err(|error| error.to_string())?;
  img.write_to(&mut file, ImageFormat::Png).map_err(|error| error.to_string())?;
  Ok(destination.to_string_lossy().to_string())
}

#[tauri::command]
pub fn save_cover_from_file(opl_root: String, game_id: String, source_path: String) -> Result<String, String> {
  let id = game_id.trim().to_uppercase();
  if id.is_empty() { return Err("missing id".into()); }
  let art_dir = PathBuf::from(&opl_root).join("ART");
  if let Err(e) = fs::create_dir_all(&art_dir) { return Err(e.to_string()); }
  let data = fs::read(&source_path).map_err(|error| error.to_string())?;
  let img = image::load_from_memory(&data).map_err(|e| e.to_string())?;
  let destination = art_dir.join(format!("{}.png", id));
  let mut buffer = Cursor::new(Vec::<u8>::new());
  img.write_to(&mut buffer, ImageFormat::Png).map_err(|error| error.to_string())?;
  fs::write(&destination, buffer.into_inner()).map_err(|error| error.to_string())?;
  Ok(destination.to_string_lossy().to_string())
}

#[derive(Deserialize)]
pub struct DeleteCoverArgs {
  #[serde(alias = "oplRoot")]
  pub opl_root: String,
  #[serde(alias = "gameId")]
  pub game_id: String,
}

#[tauri::command]
pub fn delete_cover(args: DeleteCoverArgs) -> Result<bool, String> {
  println!("🗑️ delete_cover backend called: opl_root={}, game_id={}", args.opl_root, args.game_id);
  let id = args.game_id.trim().to_uppercase();
  if id.is_empty() { return Err("missing id".into()); }
  let path = PathBuf::from(&args.opl_root).join("ART").join(format!("{}.png", id));
  println!("   → Deleting file: {}", path.display());
  match fs::remove_file(&path) {
    Ok(_) => {
      println!("   ✅ File deleted successfully");
      Ok(true)
    },
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
      println!("   ⚠️ File not found (already deleted?)");
      Ok(false)
    },
    Err(e) => {
      println!("   ❌ Error deleting file: {}", e);
      Err(e.to_string())
    },
  }
}
