use std::fs::File;
use std::io::{BufReader, Read, Seek, SeekFrom};
use std::path::PathBuf;

const SECTOR_SIZE: usize = 2352;

#[derive(Debug, Clone, serde::Serialize)]
pub struct CddaInfo {
    pub has_audio: bool,
    pub audio_tracks: usize,
    pub total_audio_mb: f64,
    pub warning_message: Option<String>,
}

#[tauri::command]
pub fn detect_cdda(iso_path: String) -> Result<CddaInfo, String> {
    let path = PathBuf::from(&iso_path);
    if !path.exists() {
        return Err("File not found".into());
    }
    
    let mut file = BufReader::new(
        File::open(&path).map_err(|e| format!("Failed to open: {}", e))?
    );
    
    let file_size = file.get_ref().metadata().map_err(|e| e.to_string())?.len();
    let sector_count = file_size / SECTOR_SIZE as u64;
    
    let mut audio_tracks = 0;
    let mut total_audio_bytes = 0u64;
    let mut in_audio = false;
    let mut buffer = [0u8; SECTOR_SIZE];
    
    // Sample every 2000 sectors for faster analysis (still accurate)
    for sector in (0..sector_count).step_by(2000) {
        file.seek(SeekFrom::Start(sector * SECTOR_SIZE as u64))
            .map_err(|e| format!("Seek error: {}", e))?;
        
        if file.read_exact(&mut buffer).is_ok() {
            let is_audio = check_audio_sector(&buffer);
            
            if is_audio && !in_audio {
                audio_tracks += 1;
                in_audio = true;
            } else if !is_audio && in_audio {
                in_audio = false;
            }
            
            if is_audio {
                total_audio_bytes += SECTOR_SIZE as u64 * 2000;
            }
        }
    }
    
    let has_audio = audio_tracks > 0;
    let total_audio_mb = total_audio_bytes as f64 / 1_048_576.0;
    
    let warning = if has_audio {
        Some(format!(
            "This game contains {} audio track(s) ({:.1} MB). CDDA audio may not work in OPL.",
            audio_tracks, total_audio_mb
        ))
    } else {
        None
    };
    
    Ok(CddaInfo {
        has_audio,
        audio_tracks,
        total_audio_mb,
        warning_message: warning,
    })
}

fn check_audio_sector(sector: &[u8]) -> bool {
    if sector.len() < 100 { return false; }
    
    let sample = &sector[0..100];
    let mean: u32 = sample.iter().map(|&b| b as u32).sum::<u32>() / 100;
    let variance: u32 = sample.iter()
        .map(|&b| { let d = b as i32 - mean as i32; (d * d) as u32 })
        .sum::<u32>() / 100;
    
    variance > 3000 && variance < 8000
}
