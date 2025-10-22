use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use regex::Regex;

use crate::scanner;

#[derive(Serialize)]
pub struct RenameProposal {
  pub from: String,
  pub to: String,
  pub will_change: bool,
  pub error: Option<String>,
}

fn sanitize_title(s: &str) -> String {
  let mut out = String::with_capacity(s.len());
  for ch in s.chars() {
    let ok = ch.is_ascii_alphanumeric() || matches!(ch, ' ' | '-' | '_' | '(' | ')' | '.' | ',');
    if ok { out.push(ch) } else { out.push(' ') }
  }
  let re_spaces = Regex::new(r"\s+").unwrap();
  let trimmed = out.trim();
  re_spaces.replace_all(trimmed, " ").to_string()
}

fn truncate_filename(base_name: &str, ext: &str, limit: usize) -> String {
  let ext_len = ext.len();
  let mut name = base_name.to_string();
  if name.len() + ext_len > limit {
    let keep = limit - ext_len;
    name.truncate(keep.max(0));
    name = name.trim().to_string();
  }
  format!("{}{}", name, ext)
}

fn format_game_filename(id: Option<&str>, title: Option<&str>) -> String {
  let id_part = id.unwrap_or("UNKNOWN");
  let final_title = title.map(sanitize_title);
  let base = if let Some(t) = final_title.as_deref() {
    if t.is_empty() { id_part.to_string() } else { format!("{} - {}", id_part, t) }
  } else {
    id_part.to_string()
  };
  truncate_filename(&base, ".iso", 80)
}

#[tauri::command]
pub fn preview_renames(opl_root: String) -> Vec<RenameProposal> {
  let games = scanner::scan_opl_games(opl_root.clone());
  let mut res: Vec<RenameProposal> = Vec::new();
  let root = PathBuf::from(&opl_root);
  for g in games {
    let target_name = format_game_filename(g.id.as_deref(), g.title_guess.as_deref());
    let current = PathBuf::from(&g.path);
    let dir = current.parent().unwrap_or(root.as_path());
    let to_path = dir.join(&target_name);
    let from_str = current.to_string_lossy().to_string();
    let to_str = to_path.to_string_lossy().to_string();
    let will_change = current
      .file_name()
      .map(|f| f.to_string_lossy() != target_name)
      .unwrap_or(true);
    res.push(RenameProposal { from: from_str, to: to_str, will_change, error: None });
  }
  res
}

#[tauri::command]
pub fn apply_renames(opl_root: String) -> Vec<RenameProposal> {
  let mut proposals = preview_renames(opl_root);
  for p in proposals.iter_mut() {
    if !p.will_change { continue; }
    let from = Path::new(&p.from);
    let to = Path::new(&p.to);
    if to.exists() {
      p.error = Some("Target exists".into());
      continue;
    }
    if let Err(e) = fs::rename(from, to) {
      p.error = Some(e.to_string());
    }
  }
  proposals
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_sanitize_title_basic() {
    assert_eq!(sanitize_title("Gran Turismo 4"), "Gran Turismo 4");
    assert_eq!(sanitize_title("Ratchet & Clank: Up Your Arsenal"), "Ratchet   Clank: Up Your Arsenal");
  }

  #[test]
  fn test_truncate_filename_limit() {
    let base = "A".repeat(100);
    let s = truncate_filename(&base, ".iso", 80);
    assert!(s.len() <= 80);
    assert!(s.ends_with(".iso"));
  }

  #[test]
  fn test_format_game_filename() {
    let s = format_game_filename(Some("SLUS_203.12"), Some("Metal Gear Solid 2"));
    assert!(s.starts_with("SLUS_203.12 - Metal Gear Solid 2"));
    assert!(s.ends_with(".iso"));
  }
}
