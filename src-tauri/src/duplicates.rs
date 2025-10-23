use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::scanner;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateGame {
  pub path: String,
  pub file_name: String,
  pub size: u64,
  pub id: Option<String>,
  pub title_guess: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateGroup {
  pub game_id: String,
  pub count: usize,
  pub total_size: u64,
  pub games: Vec<DuplicateGame>,
}

/// Finds duplicate games in a folder by Game ID
#[tauri::command]
pub fn find_duplicate_games(folder: String) -> Vec<DuplicateGroup> {
  let games = scanner::scan_folder_games(folder);
  
  // Group games by ID
  let mut by_id: HashMap<String, Vec<DuplicateGame>> = HashMap::new();
  
  for game in games {
    // Only consider games with a valid ID
    if let Some(id) = &game.id {
      if !id.is_empty() {
        let duplicate_game = DuplicateGame {
          path: game.path.clone(),
          file_name: game.file_name.clone(),
          size: game.size,
          id: game.id.clone(),
          title_guess: game.title_guess.clone(),
        };
        
        by_id.entry(id.clone()).or_insert_with(Vec::new).push(duplicate_game);
      }
    }
  }
  
  // Filter to only groups with duplicates
  let mut duplicates: Vec<DuplicateGroup> = by_id
    .into_iter()
    .filter(|(_, games)| games.len() > 1)
    .map(|(game_id, games)| {
      let total_size = games.iter().map(|g| g.size).sum();
      let count = games.len();
      
      DuplicateGroup {
        game_id,
        count,
        total_size,
        games,
      }
    })
    .collect();
  
  // Sort by count (most duplicates first)
  duplicates.sort_by(|a, b| b.count.cmp(&a.count));
  
  duplicates
}

/// Get statistics about duplicates
#[tauri::command]
pub fn get_duplicate_stats(folder: String) -> serde_json::Value {
  let duplicates = find_duplicate_games(folder);
  
  let total_duplicate_groups = duplicates.len();
  let total_duplicate_files: usize = duplicates.iter().map(|g| g.count - 1).sum(); // -1 car 1 est l'original
  let wasted_space: u64 = duplicates.iter()
    .map(|g| {
      // Taille gaspillée = taille totale - taille d'un exemplaire
      let avg_size = if g.count > 0 { g.total_size / g.count as u64 } else { 0 };
      g.total_size - avg_size
    })
    .sum();
  
  serde_json::json!({
    "total_duplicate_groups": total_duplicate_groups,
    "total_duplicate_files": total_duplicate_files,
    "wasted_space_bytes": wasted_space,
    "wasted_space_mb": wasted_space / 1_048_576,
    "wasted_space_gb": wasted_space as f64 / 1_073_741_824.0,
  })
}
