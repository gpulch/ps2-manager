use serde::Serialize;
use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};
use regex::Regex;
use crate::iso;

// Limits to protect from scanning huge folders accidentally
const LIB_SCAN_MAX_DEPTH: u32 = 6;
const LIB_SCAN_MAX_VISITED: u64 = 50_000;
const VALIDATE_MAX_DEPTH: u32 = 4;
const VALIDATE_MAX_VISITED: u64 = 20_000;

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

#[tauri::command]
pub fn check_writeable_folder(folder: String) -> Result<bool, String> {
  let root = PathBuf::from(&folder);
  if !root.is_dir() { return Ok(false); }
  let test = root.join(".ps2_manager_write_test");
  match fs::write(&test, b"ok") {
    Ok(_) => {
      let _ = fs::remove_file(&test);
      Ok(true)
    }
    Err(e) => Err(e.to_string()),
  }
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
      if fs::symlink_metadata(&p).map(|m| m.file_type().is_symlink()).unwrap_or(false) { continue; }
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
      if fs::symlink_metadata(&p).map(|m| m.file_type().is_symlink()).unwrap_or(false) { continue; }
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
  if root.is_dir() {
    let mut visited: u64 = 0;
    scan_folder_recursive_limited(&root, &root, 0, LIB_SCAN_MAX_DEPTH, &mut visited, LIB_SCAN_MAX_VISITED, &mut games);
  }
  games
}

fn scan_folder_recursive_limited(root: &Path, dir: &Path, depth: u32, max_depth: u32, visited: &mut u64, max_visited: u64, out: &mut Vec<GameInfo>) {
  if *visited >= max_visited || depth > max_depth { return; }
  if let Ok(entries) = fs::read_dir(dir) {
    for e in entries.flatten() {
      if *visited >= max_visited { return; }
      *visited += 1;
      let p = e.path();
      if fs::symlink_metadata(&p).map(|m| m.file_type().is_symlink()).unwrap_or(false) { continue; }
      if p.is_dir() {
        scan_folder_recursive_limited(root, &p, depth + 1, max_depth, visited, max_visited, out);
      } else if p.is_file() {
        if let Some(ext) = p.extension().and_then(|s| s.to_str()) {
          if ext.eq_ignore_ascii_case("iso") { out.push(scan_iso_any(root, &p)); }
        }
      }
    }
  }
}

#[derive(Serialize)]
pub struct LibraryValidation {
  pub iso_count: u32,
  pub dir_count: u32,
  pub file_count: u32,
  pub warnings: Vec<String>,
  pub ok: bool,
}

#[tauri::command]
pub fn validate_library_folder(folder: String) -> LibraryValidation {
  let root = PathBuf::from(&folder);
  let mut iso_count: u32 = 0;
  let mut file_count: u32 = 0;
  let mut dir_count: u32 = 0;
  let mut warnings: Vec<String> = Vec::new();
  let mut ok = true;

  if !root.is_dir() {
    return LibraryValidation { iso_count: 0, dir_count: 0, file_count: 0, warnings: vec!["not a directory".into()], ok: false };
  }

  // Heuristics to avoid scanning entire system roots
  if root.parent().is_none() {
    warnings.push("Selected a filesystem root; this may be too large".into());
  }

  let max_depth: u32 = VALIDATE_MAX_DEPTH; // shallower than the scan to be quick
  let max_visited: u64 = VALIDATE_MAX_VISITED;
  let mut visited: u64 = 0;

  fn visit(dir: &Path, depth: u32, max_depth: u32, visited: &mut u64, max_visited: u64, iso_count: &mut u32, file_count: &mut u32, dir_count: &mut u32) {
    if *visited >= max_visited || depth > max_depth { return; }
    if let Ok(entries) = fs::read_dir(dir) {
      for e in entries.flatten() {
        if *visited >= max_visited { return; }
        *visited += 1;
        let p = e.path();
        if fs::symlink_metadata(&p).map(|m| m.file_type().is_symlink()).unwrap_or(false) { continue; }
        if p.is_dir() {
          *dir_count += 1;
          visit(&p, depth + 1, max_depth, visited, max_visited, iso_count, file_count, dir_count);
        } else if p.is_file() {
          *file_count += 1;
          if let Some(ext) = p.extension().and_then(|s| s.to_str()) {
            if ext.eq_ignore_ascii_case("iso") { *iso_count += 1; }
          }
        }
      }
    }
  }

  visit(&root, 0, max_depth, &mut visited, max_visited, &mut iso_count, &mut file_count, &mut dir_count);

  if iso_count == 0 {
    warnings.push("No .iso files found in the selected folder".into());
    ok = false;
  }
  if visited >= max_visited {
    warnings.push("Folder seems very large; scanning was limited".into());
  }

  LibraryValidation { iso_count, dir_count, file_count, warnings, ok }
}

#[derive(Serialize)]
pub struct FolderValidation {
  pub dir_count: u32,
  pub file_count: u32,
  pub warnings: Vec<String>,
  pub ok: bool,
}

#[tauri::command]
pub fn validate_generic_folder(folder: String) -> FolderValidation {
  let root = PathBuf::from(&folder);
  let mut file_count: u32 = 0;
  let mut dir_count: u32 = 0;
  let mut warnings: Vec<String> = Vec::new();
  let mut ok = true;

  if !root.is_dir() {
    return FolderValidation { dir_count: 0, file_count: 0, warnings: vec!["not a directory".into()], ok: false };
  }

  if root.parent().is_none() {
    warnings.push("Selected a filesystem root; this may be too large".into());
    ok = false;
  }

  let max_depth: u32 = 4;
  let max_visited: u64 = 20_000;
  let mut visited: u64 = 0;

  fn visit(dir: &Path, depth: u32, max_depth: u32, visited: &mut u64, max_visited: u64, file_count: &mut u32, dir_count: &mut u32) {
    if *visited >= max_visited || depth > max_depth { return; }
    if let Ok(entries) = fs::read_dir(dir) {
      for e in entries.flatten() {
        if *visited >= max_visited { return; }
        *visited += 1;
        let p = e.path();
        if fs::symlink_metadata(&p).map(|m| m.file_type().is_symlink()).unwrap_or(false) { continue; }
        if p.is_dir() {
          *dir_count += 1;
          visit(&p, depth + 1, max_depth, visited, max_visited, file_count, dir_count);
        } else if p.is_file() {
          *file_count += 1;
        }
      }
    }
  }

  visit(&root, 0, max_depth, &mut visited, max_visited, &mut file_count, &mut dir_count);

  if visited >= max_visited {
    warnings.push("Folder seems very large; scanning was limited".into());
    ok = false;
  }

  FolderValidation { dir_count, file_count, warnings, ok }
}
