use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize)]
pub struct ValidationReport {
  pub root: String,
  pub present: Vec<String>,
  pub missing: Vec<String>,
}

fn has_opl_structure<P: AsRef<Path>>(p: P) -> bool {
  let p = p.as_ref();
  let required = ["DVD", "CD", "ART", "CFG", "CHT", "VMC"];
  required.iter().all(|d| p.join(d).is_dir())
}

#[tauri::command]
pub fn suggest_opl_roots() -> Vec<String> {
  let mut candidates: Vec<String> = Vec::new();

  #[cfg(target_os = "macos")]
  {
    let volumes = Path::new("/Volumes");
    if let Ok(entries) = fs::read_dir(volumes) {
      for e in entries.flatten() {
        let mnt = e.path();
        if !mnt.is_dir() { continue; }
        if has_opl_structure(&mnt) {
          if let Some(s) = mnt.to_str() { candidates.push(s.to_string()); }
        }
        let nested = mnt.join("OpenPS2Loader");
        if nested.is_dir() && has_opl_structure(&nested) {
          if let Some(s) = nested.to_str() { candidates.push(s.to_string()); }
        }
      }
    }
  }

  #[cfg(target_os = "windows")]
  {
    for letter in b'A'..=b'Z' {
      let drive = format!("{}:", letter as char);
      let pb = PathBuf::from(&drive);
      if pb.is_dir() {
        if has_opl_structure(&pb) {
          candidates.push(drive.clone());
        }
        let nested = pb.join("OpenPS2Loader");
        if nested.is_dir() && has_opl_structure(&nested) {
          if let Some(s) = nested.to_str() { candidates.push(s.to_string()); }
        }
      }
    }
  }

  #[cfg(all(not(target_os = "macos"), not(target_os = "windows")))]
  {
    for base in ["/media", "/mnt"].iter() {
      let basep = Path::new(base);
      if let Ok(entries) = fs::read_dir(basep) {
        for e in entries.flatten() {
          let mnt = e.path();
          if !mnt.is_dir() { continue; }
          if has_opl_structure(&mnt) {
            if let Some(s) = mnt.to_str() { candidates.push(s.to_string()); }
          }
          let nested = mnt.join("OpenPS2Loader");
          if nested.is_dir() && has_opl_structure(&nested) {
            if let Some(s) = nested.to_str() { candidates.push(s.to_string()); }
          }
        }
      }
    }
  }

  candidates
}

#[tauri::command]
pub fn validate_opl_dir(path: String) -> ValidationReport {
  let root = PathBuf::from(&path);
  let required = ["DVD", "CD", "ART", "CFG", "CHT", "VMC"];
  let mut present = Vec::new();
  let mut missing = Vec::new();

  for d in required.iter() {
    let p = root.join(d);
    if p.is_dir() { present.push((*d).to_string()); } else { missing.push((*d).to_string()); }
  }

  ValidationReport {
    root: path,
    present,
    missing,
  }
}

#[tauri::command]
pub fn fix_opl_structure(path: String) -> ValidationReport {
  let root = PathBuf::from(&path);
  let dirs = ["DVD", "CD", "ART", "CFG", "CHT", "VMC"];
  for d in dirs.iter() {
    let _ = fs::create_dir_all(root.join(d));
  }
  validate_opl_dir(path)
}
