use std::fs::{self, File};
use std::path::PathBuf;

use image::ImageFormat;

fn normalize_ids(id: &str) -> Vec<String> {
  let up = id.trim().to_uppercase();
  let mut parts: Vec<String> = Vec::new();
  // Original
  parts.push(up.clone());
  // Remove dot
  parts.push(up.replace('.', ""));
  // Underscore to hyphen, remove dot
  parts.push(up.replace('_', "-").replace('.', ""));
  // Remove all non-alnum
  parts.push(up.chars().filter(|c| c.is_ascii_alphanumeric()).collect());
  parts
}

#[tauri::command]
pub fn auto_fetch_cover(opl_root: String, game_id: String, _title_guess: Option<String>, force: bool) -> Result<String, String> {
  let id = game_id.trim().to_uppercase();
  if id.is_empty() { return Err("missing id".into()); }
  let art_dir = PathBuf::from(&opl_root).join("ART");
  fs::create_dir_all(&art_dir).map_err(|e| e.to_string())?;
  let dest = art_dir.join(format!("{}.png", id));
  if dest.exists() && !force { return Ok(dest.to_string_lossy().to_string()); }

  let candidates = normalize_ids(&id);
  let mut urls: Vec<String> = Vec::new();
  for cid in candidates {
    urls.push(format!("https://art.gametdb.com/ps2/cover2/{}.png", cid));
    urls.push(format!("https://art.gametdb.com/ps2/cover2/US/{}.png", cid));
    urls.push(format!("https://art.gametdb.com/ps2/cover2/EN/{}.png", cid));
    urls.push(format!("https://art.gametdb.com/ps2/cover/{}.png", cid));
  }

  // Try downloads in order
  for u in urls {
    if let Ok(resp) = reqwest::blocking::get(&u) {
      if resp.status().is_success() {
        if let Ok(bytes) = resp.bytes() {
          if let Ok(img) = image::load_from_memory(&bytes) {
            let mut f = File::create(&dest).map_err(|e| e.to_string())?;
            if let Err(e) = img.write_to(&mut f, ImageFormat::Png) { return Err(e.to_string()); }
            return Ok(dest.to_string_lossy().to_string());
          }
        }
      }
    }
  }

  Err("no cover found".into())
}
