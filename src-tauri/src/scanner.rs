use serde::Serialize;
use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};
use regex::Regex;
use crate::iso;

#[derive(Serialize)]
pub struct GameInfo {
  pub path: String,
  pub file_name: String,
  pub size: u64,
  pub kind: String,
  pub id: Option<String>,
  pub title_guess: Option<String>,
  pub warnings: Vec<String>,
  pub has_cover: bool,
  pub cover_path: Option<String>,
}

fn extract_id_from_filename(name: &str) -> Option<String> {
  let re = Regex::new(r"(?i)([A-Z]{4}_[0-9]{3}\.[0-9]{2})").ok()?;
  let caps = re.captures(name)?;
  Some(caps.get(1)?.as_str().to_uppercase())
}

fn guess_title_from_filename(name: &str) -> Option<String> {
  let stem = Path::new(name).file_stem()?.to_string_lossy();
  let s = Regex::new(r"(?i)\s*\[?[A-Z]{4}_[0-9]{3}\.[0-9]{2}\]?\s*-")
    .ok()
    .and_then(|re| Some(re.replace(&stem, "").to_string()))
    .unwrap_or_else(|| stem.to_string());
  let s = Regex::new(r"\[(?i)[A-Z]{4}_[0-9]{3}\.[0-9]{2}\]")
    .ok()
    .and_then(|re| Some(re.replace(&s, "").to_string()))
    .unwrap_or(s);
  let s = s.trim().to_string();
  if s.is_empty() { None } else { Some(s) }
}

fn scan_iso(root: &Path, path: &Path, kind: &str) -> GameInfo {
  let file_name = path.file_name().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
  let size = fs::metadata(path).map(|m| m.len()).unwrap_or(0);
  let mut id: Option<String> = None;
  let mut warnings: Vec<String> = Vec::new();

  if id.is_none() {
    if let Some(by_name) = extract_id_from_filename(&file_name) { id = Some(by_name); }
    else {
      if let Some(parsed) = iso::read_system_cnf_id(path) { id = Some(parsed); }
      if id.is_none() {
      let mut f = match File::open(path) { Ok(f) => f, Err(_) => {
        warnings.push("Open failed".into());
        let title_guess = guess_title_from_filename(&file_name);
        return GameInfo { path: path.to_string_lossy().to_string(), file_name, size, kind: kind.to_string(), id: None, title_guess, warnings, has_cover: false, cover_path: None };
      }};
      let mut buf = vec![0u8; 4 * 1024 * 1024];
      let n = match f.read(&mut buf) { Ok(n) => n, Err(_) => 0 };
      if n > 0 {
        let hay = String::from_utf8_lossy(&buf[..n]).to_string();
        if let Some(found) = extract_id_from_filename(&hay) { id = Some(found); }
      }
      if id.is_none() { warnings.push("Missing ID".into()); }
      }
    }
  }

  let title_guess = guess_title_from_filename(&file_name);
  let mut has_cover = false;
  let mut cover_path: Option<String> = None;
  if let Some(ref gid) = id {
    let candidate = root.join("ART").join(format!("{}.png", gid));
    if candidate.exists() {
      has_cover = true;
      cover_path = Some(candidate.to_string_lossy().to_string());
    }
  }

  GameInfo {
    path: path.to_string_lossy().to_string(),
    file_name,
    size,
    kind: kind.to_string(),
    id,
    title_guess,
    warnings,
    has_cover,
    cover_path,
  }
}

fn scan_iso_any(root: &Path, path: &Path) -> GameInfo {
  let size = fs::metadata(path).map(|m| m.len()).unwrap_or(0);
  let kind = if size <= 800 * 1024 * 1024 { "CD" } else { "DVD" };
  scan_iso(root, path, kind)
}

fn scan_dir(root: &Path, dir: &Path, kind: &str, out: &mut Vec<GameInfo>) {
  if let Ok(entries) = fs::read_dir(dir) {
    for e in entries.flatten() {
      let p = e.path();
      if p.is_file() {
        if let Some(ext) = p.extension().and_then(|s| s.to_str()) {
          if ext.eq_ignore_ascii_case("iso") {
            out.push(scan_iso(root, &p, kind));
          }
        }
      }
    }
  }
}

#[tauri::command]
pub fn scan_opl_games(opl_root: String) -> Vec<GameInfo> {
  let root = PathBuf::from(&opl_root);
  let mut games: Vec<GameInfo> = Vec::new();
  let dvd = root.join("DVD");
  let cd = root.join("CD");
  if dvd.is_dir() { scan_dir(&root, &dvd, "DVD", &mut games); }
  if cd.is_dir() { scan_dir(&root, &cd, "CD", &mut games); }
  games
}

fn scan_folder_recursive(root: &Path, dir: &Path, out: &mut Vec<GameInfo>) {
  if let Ok(entries) = fs::read_dir(dir) {
    for e in entries.flatten() {
      let p = e.path();
      if p.is_dir() {
        scan_folder_recursive(root, &p, out);
      } else if p.is_file() {
        if let Some(ext) = p.extension().and_then(|s| s.to_str()) {
          if ext.eq_ignore_ascii_case("iso") { out.push(scan_iso_any(root, &p)); }
        }
      }
    }
  }
}

#[tauri::command]
pub fn scan_folder_games(folder: String) -> Vec<GameInfo> {
  let root = PathBuf::from(&folder);
  let mut games: Vec<GameInfo> = Vec::new();
  if root.is_dir() { scan_folder_recursive(&root, &root, &mut games); }
  games
}
