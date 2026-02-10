use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GameMetadata {
    pub title: String,
    pub description: Option<String>,
    pub release_date: Option<String>,
    pub metacritic_score: Option<i32>,
    pub user_score: Option<f32>,
    pub genres: Vec<String>,
    pub publishers: Vec<String>,
    pub developers: Vec<String>,
    pub platforms: Vec<String>,
    pub multiplayer: Option<bool>,
    pub coop: Option<bool>,
    pub esrb_rating: Option<String>,
    pub background_image: Option<String>,
    pub website: Option<String>,
    pub metacritic_url: Option<String>,
}

#[derive(Debug, Deserialize)]
struct RawgSearchResponse {
    results: Vec<RawgGame>,
}

#[derive(Debug, Deserialize)]
struct RawgGame {
    name: String,
    released: Option<String>,
    metacritic: Option<i32>,
    background_image: Option<String>,
    slug: String,
}

#[derive(Debug, Deserialize)]
struct RawgGameDetails {
    name: String,
    description_raw: Option<String>,
    released: Option<String>,
    metacritic: Option<i32>,
    background_image: Option<String>,
    genres: Option<Vec<RawgGenre>>,
    publishers: Option<Vec<RawgPublisher>>,
    developers: Option<Vec<RawgDeveloper>>,
    platforms: Option<Vec<RawgPlatformWrapper>>,
    esrb_rating: Option<RawgEsrbRating>,
    website: Option<String>,
    metacritic_url: Option<String>,
    tags: Option<Vec<RawgTag>>,
}

#[derive(Debug, Deserialize)]
struct RawgGenre {
    name: String,
}

#[derive(Debug, Deserialize)]
struct RawgPublisher {
    name: String,
}

#[derive(Debug, Deserialize)]
struct RawgDeveloper {
    name: String,
}

#[derive(Debug, Deserialize)]
struct RawgPlatformWrapper {
    platform: RawgPlatform,
}

#[derive(Debug, Deserialize)]
struct RawgPlatform {
    name: String,
}

#[derive(Debug, Deserialize)]
struct RawgEsrbRating {
    name: String,
}

#[derive(Debug, Deserialize)]
struct RawgTag {
    name: String,
}

// Clean game title for better API search
fn clean_title_for_search(title: &str) -> String {
    title
        .replace(" - ", " ")
        .replace("_", " ")
        .replace("  ", " ")
        // Remove common PS2 suffixes
        .replace("(USA)", "")
        .replace("(Europe)", "")
        .replace("(Japan)", "")
        .replace("[SLUS", "")
        .replace("[SLES", "")
        .replace("[SLPS", "")
        // Remove disc numbers
        .replace("Disc 1", "")
        .replace("Disc 2", "")
        .replace("Disc 3", "")
        .replace("Disc 4", "")
        .trim()
        .to_string()
}

#[tauri::command]
pub async fn fetch_game_metadata(game_title: String, _game_id: Option<String>) -> Result<GameMetadata, String> {
    println!("🎮 Fetching metadata for: {}", game_title);
    
    // Get API key from environment variable
    let api_key = std::env::var("RAWG_API_KEY").unwrap_or_else(|_| {
        println!("   ⚠️ RAWG_API_KEY not set in environment");
        String::new()
    });
    
    if api_key.is_empty() {
        return Err("RAWG API key not configured. Please set RAWG_API_KEY environment variable. Get a free key at https://rawg.io/apidocs".to_string());
    }
    
    let cleaned_title = clean_title_for_search(&game_title);
    println!("   → Cleaned title: {}", cleaned_title);
    
    // Search for game on RAWG
    let search_url = format!(
        "https://api.rawg.io/api/games?key={}&search={}&page_size=1&platforms=16",
        api_key,
        urlencoding::encode(&cleaned_title)
    );
    
    println!("   → Searching RAWG API...");
    
    let client = reqwest::Client::builder()
        .user_agent("PS2Manager/1.0")
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;
    
    // Search for game
    let search_response = client
        .get(&search_url)
        .send()
        .await
        .map_err(|e| format!("Search request failed: {}", e))?;
    
    if !search_response.status().is_success() {
        return Err(format!("Search failed with status: {}", search_response.status()));
    }
    
    let search_data: RawgSearchResponse = search_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse search results: {}", e))?;
    
    if search_data.results.is_empty() {
        return Err("No games found".to_string());
    }
    
    let game = &search_data.results[0];
    println!("   ✓ Found: {}", game.name);
    
    // Fetch detailed information
    let details_url = format!(
        "https://api.rawg.io/api/games/{}?key={}",
        game.slug,
        api_key
    );
    
    let details_response = client
        .get(&details_url)
        .send()
        .await
        .map_err(|e| format!("Details request failed: {}", e))?;
    
    if !details_response.status().is_success() {
        return Err(format!("Details fetch failed with status: {}", details_response.status()));
    }
    
    let details: RawgGameDetails = details_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse game details: {}", e))?;
    
    // Extract multiplayer/coop info from tags
    let mut multiplayer = false;
    let mut coop = false;
    
    if let Some(tags) = &details.tags {
        for tag in tags {
            let tag_lower = tag.name.to_lowercase();
            if tag_lower.contains("multiplayer") || tag_lower.contains("multi-player") {
                multiplayer = true;
            }
            if tag_lower.contains("co-op") || tag_lower.contains("coop") || tag_lower.contains("cooperative") {
                coop = true;
            }
        }
    }
    
    // Build metadata
    let metadata = GameMetadata {
        title: details.name,
        description: details.description_raw,
        release_date: details.released,
        metacritic_score: details.metacritic,
        user_score: None, // RAWG doesn't provide user scores in same format
        genres: details.genres
            .unwrap_or_default()
            .iter()
            .map(|g| g.name.clone())
            .collect(),
        publishers: details.publishers
            .unwrap_or_default()
            .iter()
            .map(|p| p.name.clone())
            .collect(),
        developers: details.developers
            .unwrap_or_default()
            .iter()
            .map(|d| d.name.clone())
            .collect(),
        platforms: details.platforms
            .unwrap_or_default()
            .iter()
            .map(|p| p.platform.name.clone())
            .collect(),
        multiplayer: Some(multiplayer),
        coop: Some(coop),
        esrb_rating: details.esrb_rating.map(|r| r.name),
        background_image: details.background_image,
        website: details.website,
        metacritic_url: details.metacritic_url,
    };
    
    println!("   Metadata fetched successfully");
    println!("      Score: {:?}", metadata.metacritic_score);
    println!("      Genres: {:?}", metadata.genres);
    println!("      Multiplayer: {:?}", metadata.multiplayer);
    
    Ok(metadata)
}

#[tauri::command]
pub async fn batch_fetch_metadata(games: Vec<(String, Option<String>)>) -> Result<HashMap<String, GameMetadata>, String> {
    println!("📦 Batch fetching metadata for {} games", games.len());
    
    let total_games = games.len();
    let mut results = HashMap::new();
    
    for (title, id) in &games {
        match fetch_game_metadata(title.clone(), id.clone()).await {
            Ok(metadata) => {
                results.insert(title.clone(), metadata);
            }
            Err(e) => {
                println!("   Failed to fetch metadata for {}: {}", title, e);
            }
        }
        
        // Rate limiting - be nice to the API
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
    }
    
    println!("   Batch complete: {}/{} succeeded", results.len(), total_games);
    
    Ok(results)
}
