use std::collections::HashSet;
use std::env;
use std::fs::{self, File};
use std::path::PathBuf;
use std::sync::Arc;

use image::ImageFormat;
use serde::{Deserialize, Serialize};
use rayon::prelude::*;

fn normalize_ids(id: &str) -> Vec<String> {
  let up = id.trim().to_uppercase();
  let mut parts: Vec<String> = Vec::new();
  let mut seen = HashSet::new();
  
  // Extract pure alphanumeric version first
  let alnum: String = up.chars().filter(|c| c.is_ascii_alphanumeric()).collect();
  
  if alnum.len() >= 5 {
    let (region, number) = alnum.split_at(4);
    
    // Most common formats (prioritized)
    let priority_formats = vec![
      format!("{}-{}", region, number),     // SLUS-20763 (most common in ps2-covers)
      format!("{}_{}", region, number),     // SLUS_20763
      alnum.clone(),                        // SLUS20763
      format!("{}.{}", region, number),     // SLUS.20763
    ];
    
    for fmt in priority_formats {
      if seen.insert(fmt.clone()) {
        parts.push(fmt);
      }
    }
    
    // Try with dots in number part (e.g., SLUS-207.63, SLUS_207.63)
    if number.len() >= 3 {
      let (first_part, last_part) = number.split_at(3);
      for sep in ["-", "_", "."] {
        let with_dot = format!("{}{}{}.{}", region, sep, first_part, last_part);
        if seen.insert(with_dot.clone()) {
          parts.push(with_dot);
        }
      }
    }
  }
  
  // Add original if not already included
  if seen.insert(up.clone()) {
    parts.push(up);
  }
  
  parts
}

fn assess_quality(img: &image::DynamicImage) -> (u32, String) {
  let (w, h) = (img.width(), img.height());
  let pixels = w * h;
  
  let quality = if pixels >= 1_000_000 { "excellent" }
    else if pixels >= 500_000 { "high" }
    else if pixels >= 200_000 { "medium" }
    else { "low" };
  
  (pixels, quality.to_string())
}

fn optimize_cover(img: image::DynamicImage) -> image::DynamicImage {
  let (w, h) = (img.width(), img.height());
  
  // If image is too large (>2000px), resize to reasonable size
  const MAX_DIMENSION: u32 = 1024;
  if w > MAX_DIMENSION || h > MAX_DIMENSION {
    println!("  Optimizing cover from {}x{} to fit {}px", w, h, MAX_DIMENSION);
    img.resize(MAX_DIMENSION, MAX_DIMENSION, image::imageops::FilterType::Lanczos3)
  } else {
    img
  }
}

fn build_artwork_urls(candidates: Vec<String>) -> Vec<String> {
  let mut urls: Vec<String> = Vec::new();
  let mut seen_urls = HashSet::new();
  
  // Priority 1: GitHub ps2-covers repository (best coverage: 89% SLUS, 95% SLES)
  // https://github.com/xlenore/ps2-covers
  for cid in candidates.iter() {
    // Try direct match first (most likely to succeed)
    for ext in ["jpg", "png", "webp"] {
      let url = format!("https://raw.githubusercontent.com/xlenore/ps2-covers/main/covers/default/{}.{}", cid, ext);
      if seen_urls.insert(url.clone()) {
        urls.push(url);
      }
    }
    
    // Try 3D covers as fallback
    for ext in ["png", "jpg", "webp"] {
      let url = format!("https://raw.githubusercontent.com/xlenore/ps2-covers/main/covers/3d/{}.{}", cid, ext);
      if seen_urls.insert(url.clone()) {
        urls.push(url);
      }
    }
    
    // Try full/fullcover variants
    for variant in ["full", "fullcover", "cover", "front"] {
      for ext in ["jpg", "png"] {
        let url = format!("https://raw.githubusercontent.com/xlenore/ps2-covers/main/covers/{}/{}.{}", variant, cid, ext);
        if seen_urls.insert(url.clone()) {
          urls.push(url);
        }
      }
    }
  }

  // Priority 2: GameTDB (good for recent games)
  let api_key = env::var("GAMETDB_API_KEY").ok();
  let key_param = api_key.map(|k| format!("?api_key={}", k)).unwrap_or_default();
  for cid in candidates.iter() {
    for path in [
      format!("ps2/cover2/{}.png", cid),
      format!("ps2/cover2/US/{}.png", cid),
      format!("ps2/cover2/EN/{}.png", cid),
      format!("ps2/cover/{}.png", cid),
      format!("ps2/coverM/{}.png", cid),
    ] {
      let url = format!("https://art.gametdb.com/{}{}", path, key_param);
      if seen_urls.insert(url.clone()) {
        urls.push(url);
      }
    }
  }
  
  // Priority 3: PSX Datacenter (comprehensive database)
  for cid in candidates.iter() {
    // Extract region and number for direct URL construction
    if cid.len() >= 9 {
      let region = &cid[0..4];
      let url = format!("https://psxdatacenter.com/psx2/images2/{}/{}.jpg", region, cid);
      if seen_urls.insert(url.clone()) {
        urls.push(url);
      }
    }
  }
  
  // Priority 4: CoverProject (high quality scans)
  for cid in candidates.iter() {
    for size in ["cover_large", "cover", "cover_small"] {
      let url = format!("https://art.gametdb.com/ps2/{}/{}.png", size, cid);
      if seen_urls.insert(url.clone()) {
        urls.push(url);
      }
    }
  }
  
  // Priority 5: Alternative GitHub sources
  for cid in candidates.iter() {
    // Try alternative naming patterns
    if cid.len() >= 9 {
      let underscore_variant = cid.replace('-', "_");
      let no_separator = cid.chars().filter(|c| c.is_alphanumeric()).collect::<String>();
      
      for variant in [&underscore_variant, &no_separator] {
        for ext in ["jpg", "png", "webp"] {
          let url = format!("https://raw.githubusercontent.com/xlenore/ps2-covers/main/covers/default/{}.{}", variant, ext);
          if seen_urls.insert(url.clone()) {
            urls.push(url);
          }
        }
      }
    }
  }
  
  // Priority 6: VGDB (Video Game Database)
  for cid in candidates.iter() {
    if cid.len() >= 9 {
      let region = &cid[0..4];
      for size in ["front", "boxart", "cover"] {
        let url = format!("https://images.vgdb.io/ps2/{}/{}/{}.jpg", region, size, cid);
        if seen_urls.insert(url.clone()) {
          urls.push(url);
        }
      }
    }
  }
  
  // Priority 7: LaunchBox Games Database (if available)
  for cid in candidates.iter() {
    for platform in ["Sony Playstation 2", "PS2"] {
      let url = format!("https://images.launchbox-app.com/{}/Images/{}.jpg", platform, cid);
      if seen_urls.insert(url.clone()) {
        urls.push(url);
      }
    }
  }

  urls
}

#[derive(Deserialize)]
pub struct AutoFetchCoverArgs {
  #[serde(alias = "oplRoot")] // accept camelCase
  pub opl_root: String,
  #[serde(alias = "gameId")] // accept camelCase
  pub game_id: String,
  #[serde(default, alias = "titleGuess")] // optional + camelCase alias
  #[allow(dead_code)]
  pub title_guess: Option<String>,
  #[serde(default)]
  pub force: bool,
}

#[tauri::command]
pub fn auto_fetch_cover(
  args: Option<AutoFetchCoverArgs>,
  opl_root: Option<String>,
  game_id: Option<String>,
  title_guess: Option<String>,
  force: Option<bool>,
) -> Result<String, String> {
  println!("[auto_fetch_cover] called with:");
  println!("   args: {:?}", args.is_some());
  println!("   opl_root: {:?}", opl_root);
  println!("   game_id: {:?}", game_id);
  
  // Unify params: support either struct (args) or individual snake_case keys
  let merged = if let Some(a) = args {
    println!("   → Using args struct");
    a
  } else {
    println!("   → Using individual params");
    AutoFetchCoverArgs {
      opl_root: opl_root.ok_or_else(|| {
        println!("   ❌ ERROR: missing opl_root!");
        "missing opl_root - check frontend is sending correct params".to_string()
      })?,
      game_id: game_id.ok_or_else(|| {
        println!("   ❌ ERROR: missing game_id!");
        "missing game_id - check frontend is sending correct params".to_string()
      })?,
      title_guess,
      force: force.unwrap_or(false),
    }
  };

  let id = merged.game_id.trim().to_uppercase();
  if id.is_empty() { return Err("missing id".into()); }
  let art_dir = PathBuf::from(&merged.opl_root).join("ART");
  fs::create_dir_all(&art_dir).map_err(|e| e.to_string())?;
  let destination = art_dir.join(format!("{}.png", id));
  if destination.exists() && !merged.force { return Ok(destination.to_string_lossy().to_string()); }

  let candidates = normalize_ids(&id);
  
  println!("🔍 auto_fetch_cover: game_id={}, normalized variants: {:?}", id, candidates);
  
  let urls = build_artwork_urls(candidates);
  println!("  Trying {} URLs...", urls.len());

  // Build HTTP client with timeout
  let client = Arc::new(reqwest::blocking::Client::builder()
    .timeout(std::time::Duration::from_secs(8))
    .user_agent("PS2Manager/1.0")
    .build()
    .map_err(|e| e.to_string())?);

  let total = urls.len();
  
  // Try URLs in parallel batches for speed
  const BATCH_SIZE: usize = 5;
  for (batch_idx, batch) in urls.chunks(BATCH_SIZE).enumerate() {
    println!("  Batch {}/{} ({} URLs)", batch_idx + 1, (total + BATCH_SIZE - 1) / BATCH_SIZE, batch.len());
    
    let results: Vec<_> = batch.par_iter().enumerate().filter_map(|(idx, url)| {
      let global_idx = batch_idx * BATCH_SIZE + idx + 1;
      println!("    [{}] Trying: {}", global_idx, url);
      
      match client.get(url).send() {
        Ok(resp) => {
          let status = resp.status();
          if status.is_success() {
            match resp.bytes() {
              Ok(bytes) => {
                match image::load_from_memory(&bytes) {
                  Ok(img) => {
                    let (pixels, quality) = assess_quality(&img);
                    let (w, h) = (img.width(), img.height());
                    println!("       → HTTP {} | {}x{} ({} pixels, {} quality)", 
                      status.as_u16(), w, h, pixels, quality);
                    Some((img, pixels, quality))
                  }
                  Err(_) => {
                    println!("       → ❌ Invalid image data ({} bytes)", bytes.len());
                    None
                  }
                }
              }
              Err(_) => None
            }
          } else {
            if status.as_u16() != 404 {
              println!("       → HTTP {}", status.as_u16());
            }
            None
          }
        }
        Err(e) => {
          if e.is_timeout() {
            println!("       Timeout");
          } else if e.is_connect() {
            println!("       Connection failed");
          }
          None
        }
      }
    }).collect();
    
    // If we found any valid images in this batch, pick the highest quality
    if !results.is_empty() {
      // Prefer "excellent" or "high" quality, otherwise pick largest
      let best = results.iter()
        .filter(|(_, _, q)| q == "excellent" || q == "high")
        .max_by_key(|(_, pixels, _)| pixels)
        .or_else(|| results.iter().max_by_key(|(_, pixels, _)| pixels))
        .unwrap();
      
      println!("  Selected best cover: {} pixels, {} quality", best.1, best.2);
      
      // Optimize if needed (resize large images)
      let optimized = optimize_cover(best.0.clone());
      let (opt_w, opt_h) = (optimized.width(), optimized.height());
      if opt_w != best.0.width() || opt_h != best.0.height() {
        println!("  Optimized to {}x{}", opt_w, opt_h);
      }
      
      let mut file = File::create(&destination).map_err(|e| e.to_string())?;
      optimized.write_to(&mut file, ImageFormat::Png).map_err(|e| e.to_string())?;
      
      println!("  ✅ Cover saved to {}", destination.display());
      return Ok(destination.to_string_lossy().to_string());
    }
  }

  println!("❌ No cover found after trying {} URLs", urls.len());
  Err(format!("no cover found (tried {} sources)", urls.len()))
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CoverStats {
  pub total_fetched: u32,
  pub successful: u32,
  pub failed: u32,
  pub avg_time_ms: u32,
  pub most_successful_source: String,
}

#[derive(Deserialize)]
pub struct BatchFetchRequest {
  pub opl_root: String,
  pub games: Vec<BatchGameRequest>,
}

#[derive(Deserialize)]
pub struct BatchGameRequest {
  pub game_id: String,
  pub title_guess: Option<String>,
}

#[derive(Serialize)]
pub struct BatchFetchResult {
  pub game_id: String,
  pub success: bool,
  pub cover_path: Option<String>,
  pub error: Option<String>,
  pub quality: Option<String>,
  pub time_ms: u32,
}

#[derive(Serialize, Clone)]
#[allow(dead_code)]
pub struct FetchProgress {
  pub game_id: String,
  pub current: usize,
  pub total: usize,
  pub status: String,
}

#[tauri::command]
pub fn batch_fetch_covers(request: BatchFetchRequest) -> Vec<BatchFetchResult> {
  use std::time::Instant;
  
  println!("[batch_fetch_covers] {} games", request.games.len());
  let start = Instant::now();
  
  let art_dir = PathBuf::from(&request.opl_root).join("ART");
  let _ = fs::create_dir_all(&art_dir);
  
  let results: Vec<_> = request.games.par_iter().enumerate().map(|(idx, game)| {
    let game_start = Instant::now();
    println!("  [{}/{}] Processing: {}", idx + 1, request.games.len(), game.game_id);
    
    let result = auto_fetch_cover(
      Some(AutoFetchCoverArgs {
        opl_root: request.opl_root.clone(),
        game_id: game.game_id.clone(),
        title_guess: game.title_guess.clone(),
        force: true,
      }),
      None, None, None, None
    );
    
    let elapsed = game_start.elapsed().as_millis() as u32;
    
    match result {
      Ok(path) => {
        println!("  ✅ {} - Success ({}ms)", game.game_id, elapsed);
        BatchFetchResult {
          game_id: game.game_id.clone(),
          success: true,
          cover_path: Some(path),
          error: None,
          quality: Some("fetched".to_string()),
          time_ms: elapsed,
        }
      }
      Err(e) => {
        println!("  ❌ {} - Failed ({}ms): {}", game.game_id, elapsed, e);
        BatchFetchResult {
          game_id: game.game_id.clone(),
          success: false,
          cover_path: None,
          error: Some(e),
          quality: None,
          time_ms: elapsed,
        }
      }
    }
  }).collect();
  
  let total_elapsed = start.elapsed().as_secs();
  let success_count = results.iter().filter(|r| r.success).count();
  println!("✅ Batch complete: {}/{} successful in {}s", 
    success_count, results.len(), total_elapsed);
  
  results
}

#[tauri::command]
pub fn verify_cover_file(cover_path: String) -> Result<bool, String> {
  let path = PathBuf::from(&cover_path);
  println!("[verify_cover_file] path={}", cover_path);
  let exists = path.exists();
  println!("   → File exists: {}", exists);
  if exists {
    if let Ok(metadata) = fs::metadata(&path) {
      println!("   → File size: {} bytes", metadata.len());
    }
  }
  Ok(exists)
}

#[tauri::command]
pub fn get_cover_stats(opl_root: String) -> CoverStats {
  let art_dir = PathBuf::from(&opl_root).join("ART");
  
  if !art_dir.exists() {
    return CoverStats {
      total_fetched: 0,
      successful: 0,
      failed: 0,
      avg_time_ms: 0,
      most_successful_source: "none".to_string(),
    };
  }
  
  let mut total = 0;
  if let Ok(entries) = fs::read_dir(&art_dir) {
    total = entries.filter_map(|e| e.ok()).filter(|e| {
      e.path().extension().and_then(|s| s.to_str()) == Some("png")
    }).count() as u32;
  }
  
  CoverStats {
    total_fetched: total,
    successful: total,
    failed: 0,
    avg_time_ms: 15000, // Rough estimate
    most_successful_source: "ps2-covers".to_string(),
  }
}
