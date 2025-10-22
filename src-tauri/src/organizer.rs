use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

const CD_MAX_BYTES: u64 = 800 * 1024 * 1024; // 800 MiB threshold

#[derive(Serialize)]
pub struct OrganizeProposal {
  pub from: String,
  pub to: String,
  pub will_move: bool,
  pub reason: String,
  pub error: Option<String>,
}

fn expected_dir_for_size(size: u64) -> &'static str {
  if size <= CD_MAX_BYTES { "CD" } else { "DVD" }
}

fn collect_isos(dir: &Path, out: &mut Vec<PathBuf>) {
  if let Ok(rd) = fs::read_dir(dir) {
    for e in rd.flatten() {
      let p = e.path();
      if p.is_file() {
        if p.extension().and_then(|s| s.to_str()).map(|s| s.eq_ignore_ascii_case("iso")).unwrap_or(false) {
          out.push(p);
        }
      }
    }
  }
}

#[tauri::command]
pub fn preview_organize(opl_root: String) -> Vec<OrganizeProposal> {
  let root = PathBuf::from(&opl_root);
  let dvd = root.join("DVD");
  let cd = root.join("CD");
  let mut files: Vec<PathBuf> = Vec::new();
  if dvd.is_dir() { collect_isos(&dvd, &mut files); }
  if cd.is_dir() { collect_isos(&cd, &mut files); }

  let mut res: Vec<OrganizeProposal> = Vec::new();
  for p in files {
    let meta = match fs::metadata(&p) { Ok(m) => m, Err(_) => continue };
    let size = meta.len();
    let expected_dir = expected_dir_for_size(size);
    let in_dvd = p.parent().and_then(|d| d.file_name()).and_then(|s| s.to_str()).map(|s| s.eq_ignore_ascii_case("DVD")).unwrap_or(false);
    let in_cd = p.parent().and_then(|d| d.file_name()).and_then(|s| s.to_str()).map(|s| s.eq_ignore_ascii_case("CD")).unwrap_or(false);

    let correct = (expected_dir == "DVD" && in_dvd) || (expected_dir == "CD" && in_cd);
    let from = p.to_string_lossy().to_string();
    if correct {
      res.push(OrganizeProposal { from: from.clone(), to: from, will_move: false, reason: "correct location".into(), error: None });
      continue;
    }

    // Build destination path (keep same filename)
    let file_name = p.file_name().map(|s| s.to_string_lossy().to_string()).unwrap_or_else(|| "game.iso".into());
    let dest = root.join(expected_dir).join(file_name);
    let to = dest.to_string_lossy().to_string();
    let reason = if expected_dir == "CD" { "size <= 800MiB" } else { "size > 800MiB" }.to_string();
    res.push(OrganizeProposal { from, to, will_move: true, reason, error: None });
  }

  res
}

#[tauri::command]
pub fn apply_organize(opl_root: String) -> Vec<OrganizeProposal> {
  let mut proposals = preview_organize(opl_root);
  for p in proposals.iter_mut() {
    if !p.will_move { continue; }
    let from = Path::new(&p.from);
    let to = Path::new(&p.to);
    if let Some(parent) = to.parent() { let _ = fs::create_dir_all(parent); }
    if to.exists() {
      p.error = Some("Target exists".into());
      continue;
    }
    if let Err(e) = fs::rename(from, to) {
      p.error = Some(e.to_string());
    } else {
      p.will_move = false;
      p.reason.push_str(" (moved)");
    }
  }
  proposals
}
