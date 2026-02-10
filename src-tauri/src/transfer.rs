use std::fs;
use std::path::PathBuf;

const CD_MAX_BYTES: u64 = 800 * 1024 * 1024; // 800 MiB threshold

pub fn expected_dir_for_size(size: u64) -> &'static str {
  if size <= CD_MAX_BYTES { "CD" } else { "DVD" }
}

#[tauri::command]
pub fn copy_iso_to_opl(source_path: String, opl_root: String) -> Result<String, String> {
  let src = PathBuf::from(&source_path);
  if !src.exists() { return Err("Source file does not exist".into()); }
  if !src.is_file() { return Err("Source path is not a file".into()); }

  let file_name = src.file_name()
    .ok_or_else(|| "Invalid source file name".to_string())?
    .to_string_lossy()
    .to_string();

  let meta = fs::metadata(&src).map_err(|e| e.to_string())?;
  let size = meta.len();
  let folder = expected_dir_for_size(size);

  let root = PathBuf::from(&opl_root);
  let dest_dir = root.join(folder);
  fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;

  let dest = dest_dir.join(&file_name);
  if dest.exists() { return Ok(dest.to_string_lossy().to_string()); }

  fs::copy(&src, &dest).map_err(|e| e.to_string())?;
  Ok(dest.to_string_lossy().to_string())
}

#[tauri::command]
pub fn delete_iso_from_opl(opl_root: String, file_name: String) -> Result<bool, String> {
  let root = PathBuf::from(&opl_root);
  for folder in ["DVD", "CD"].iter() {
    let candidate = root.join(folder).join(&file_name);
    if candidate.exists() {
      fs::remove_file(&candidate).map_err(|e| e.to_string())?;
      return Ok(true)
    }
  }
  Ok(false)
}

#[tauri::command]
pub fn is_iso_present(opl_root: String, file_name: String, size: u64) -> Result<bool, String> {
  let root = PathBuf::from(&opl_root);
  // Check both expected folder and the other folder just in case
  let expected = expected_dir_for_size(size);
  let other = if expected == "DVD" { "CD" } else { "DVD" };
  let candidate1 = root.join(expected).join(&file_name);
  let candidate2 = root.join(other).join(&file_name);
  Ok(candidate1.exists() || candidate2.exists())
}
