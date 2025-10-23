use std::fs;
use std::path::PathBuf;
use regex::Regex;

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

/// Validates CHT file format and checks for master code
#[tauri::command]
pub fn validate_cht_content(content: String) -> serde_json::Value {
  const MAX_CODE_LIMIT: usize = 250;

  let mut has_master_code = false;
  let mut code_count = 0;
  let mut warnings = Vec::new();
  let mut errors = Vec::new();

  // Compile regex once (could be lazy_static in production)
  let code_regex = Regex::new(r"^[0-9A-Fa-f]{8}\s+[0-9A-Fa-f]{8}$").unwrap();
  let master_code_regex = Regex::new(r"^90[0-9A-Fa-f]{6}\s+[0-9A-Fa-f]{8}$").unwrap();

  for (line_num, line) in content.lines().enumerate() {
    let trimmed = line.trim();
    
    // Skip empty lines
    if trimmed.is_empty() { continue; }
    
    // Check if it's a code line
    if code_regex.is_match(trimmed) {
      code_count += 1;
      
      // Check if it's a master code
      if !has_master_code && master_code_regex.is_match(trimmed) {
        has_master_code = true;
      }
      
      // Check code count limit once
      if code_count == MAX_CODE_LIMIT + 1 {
        warnings.push(format!("Line {}: Code count exceeds recommended limit ({} codes)", line_num + 1, MAX_CODE_LIMIT));
      }
    }
    // Non-code lines are considered comments/descriptions (OK to ignore)
  }

  // Validation results
  if !has_master_code && code_count > 0 {
    errors.push("No master code found! Cheats require a master code starting with 90XXXXXX.".to_string());
  }

  if code_count == 0 && !content.trim().is_empty() {
    warnings.push("No valid cheat codes found in file.".to_string());
  }

  serde_json::json!({
    "valid": errors.is_empty(),
    "has_master_code": has_master_code,
    "code_count": code_count,
    "warnings": warnings,
    "errors": errors,
  })
}

/// Get CHT help text
#[tauri::command]
pub fn get_cht_help() -> String {
  r#"PS2RD Cheat File (.cht) Format Guide:

File Name: <GAME_ID>.cht (e.g., SLUS_203.99.cht)

Format:
Master Code
90XXXXXX YYYYYYYY

Cheat Name (optional, ignored)
201A2B3C 00000064
203C4D5E 000000FF

Rules:
1. Master code is REQUIRED (starts with 90)
2. 2 codes per line, separated by space
3. Each code is 8 hex characters
4. Max 250-510 codes per file
5. Codes are region-specific (NTSC/PAL)

Enable in OPL:
Menu → Cheat Settings → Enable PS2RD Cheat Engine: ON

Sources:
- GitHub: PS2-Widescreen/OPL-Widescreen-Cheats
- GameHacking.org
- Convert from Codebreaker with Omniconvert

See PS2_CHEATS_GUIDE.md for complete documentation."#.to_string()
}
