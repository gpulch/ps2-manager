use std::fs::{self, File};
use std::io::{BufReader, BufWriter, Read, Write, Seek, SeekFrom};
use std::path::{Path, PathBuf};

/// BIN/CUE to ISO converter
/// Supports converting PlayStation 2 BIN/CUE images to ISO format

const SECTOR_SIZE: usize = 2352; // RAW CD sector size
const ISO_SECTOR_SIZE: usize = 2048; // ISO data sector size
const SECTOR_HEADER: usize = 16; // CD-ROM XA header
const SECTOR_ECC: usize = 288; // Error correction

#[derive(Debug, Clone, serde::Serialize)]
pub struct ConversionProgress {
    pub converted_bytes: u64,
    pub total_bytes: u64,
    pub percentage: f64,
}

/// Parse CUE file and find BIN file
fn parse_cue_file(cue_path: &Path) -> Result<PathBuf, String> {
    let contents = fs::read_to_string(cue_path)
        .map_err(|error| format!("Failed to read CUE file: {}", error))?;
    
    // Look for FILE "filename.bin" BINARY line
    for line in contents.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("FILE") && trimmed.contains("BINARY") {
            // Extract filename between quotes
            if let Some(start) = trimmed.find('"') {
                if let Some(end) = trimmed[start + 1..].find('"') {
                    let bin_filename = &trimmed[start + 1..start + 1 + end];
                    
                    // Resolve path relative to CUE file
                    let bin_path = cue_path.parent()
                        .unwrap_or_else(|| Path::new("."))
                        .join(bin_filename);
                    
                    return Ok(bin_path);
                }
            }
        }
    }
    
    Err("No BIN file found in CUE file".into())
}

/// Check if BIN file contains RAW sectors (2352 bytes) or ISO sectors (2048 bytes)
fn detect_sector_format(bin_path: &Path) -> Result<bool, String> {
    // Get metadata without opening file (more efficient)
    let file_size = fs::metadata(bin_path)
        .map_err(|error| format!("Failed to read file metadata: {}", error))?
        .len();
    
    // If file size is divisible by 2048, it's likely already ISO format
    if file_size % ISO_SECTOR_SIZE as u64 == 0 {
        return Ok(false); // Already ISO format
    }
    
    // If divisible by 2352, it's RAW format
    if file_size % SECTOR_SIZE as u64 == 0 {
        return Ok(true); // RAW format, needs conversion
    }
    
    Err("Unknown sector format".into())
}

/// Convert BIN/CUE to ISO
#[tauri::command]
pub fn convert_bin_to_iso(
    cue_path: String,
    destination_path: String,
) -> Result<String, String> {
    let cue = PathBuf::from(&cue_path);
    let destination = PathBuf::from(&destination_path);
    
    // Parse CUE to find BIN
    let bin_path = parse_cue_file(&cue)?;
    
    if !bin_path.exists() {
        return Err(format!("BIN file not found: {}", bin_path.display()));
    }
    
    // Detect if conversion is needed
    let needs_conversion = detect_sector_format(&bin_path)?;
    
    if !needs_conversion {
        // File is already ISO format, just copy
        fs::copy(&bin_path, &destination)
            .map_err(|error| format!("Failed to copy file: {}", error))?;
        return Ok(destination.to_string_lossy().to_string());
    }
    
    // Perform RAW to ISO conversion
    convert_raw_to_iso(&bin_path, &destination)?;
    
    Ok(destination.to_string_lossy().to_string())
}

/// Convert RAW (2352 byte sectors) to ISO (2048 byte sectors)
fn convert_raw_to_iso(source: &Path, destination: &Path) -> Result<(), String> {
    // Use larger buffer sizes for better I/O performance
    const BUFFER_SIZE: usize = 256 * 1024; // 256 KB buffer
    
    let mut input = BufReader::with_capacity(
        BUFFER_SIZE,
        File::open(source)
            .map_err(|error| format!("Failed to open source: {}", error))?
    );
    
    let mut output = BufWriter::with_capacity(
        BUFFER_SIZE,
        File::create(destination)
            .map_err(|error| format!("Failed to create destination: {}", error))?
    );
    
    let mut sector_buffer = [0u8; SECTOR_SIZE];
    let mut data_buffer = [0u8; ISO_SECTOR_SIZE];
    
    loop {
        // Read RAW sector
        match input.read_exact(&mut sector_buffer) {
            Ok(_) => {},
            Err(error) if error.kind() == std::io::ErrorKind::UnexpectedEof => break,
            Err(error) => return Err(format!("Read error: {}", error)),
        }
        
        // Extract data portion (skip header and ECC)
        // CD-ROM XA Mode 2 Form 1: 16 bytes header + 2048 bytes data + 288 bytes ECC
        data_buffer.copy_from_slice(&sector_buffer[SECTOR_HEADER..SECTOR_HEADER + ISO_SECTOR_SIZE]);
        
        // Write ISO sector
        output.write_all(&data_buffer)
            .map_err(|error| format!("Write error: {}", error))?;
    }
    
    output.flush()
        .map_err(|error| format!("Flush error: {}", error))?;
    
    Ok(())
}

/// Get conversion info without actually converting
#[tauri::command]
pub fn get_conversion_info(cue_path: String) -> Result<serde_json::Value, String> {
    let cue = PathBuf::from(&cue_path);
    
    let bin_path = parse_cue_file(&cue)?;
    
    if !bin_path.exists() {
        return Err("BIN file not found".into());
    }
    
    let metadata = fs::metadata(&bin_path)
        .map_err(|error| error.to_string())?;
    
    let file_size = metadata.len();
    let needs_conversion = detect_sector_format(&bin_path)?;
    
    let output_size = if needs_conversion {
        // Calculate ISO size from RAW
        let sector_count = file_size / SECTOR_SIZE as u64;
        sector_count * ISO_SECTOR_SIZE as u64
    } else {
        file_size
    };
    
    Ok(serde_json::json!({
        "bin_path": bin_path.to_string_lossy(),
        "bin_size": file_size,
        "needs_conversion": needs_conversion,
        "output_size": output_size,
        "format": if needs_conversion { "RAW (2352)" } else { "ISO (2048)" }
    }))
}

/// Check if file is a CUE file
pub fn is_cue_file(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| extension.eq_ignore_ascii_case("cue"))
        .unwrap_or(false)
}

/// Check if file is a BIN file
pub fn is_bin_file(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| extension.eq_ignore_ascii_case("bin"))
        .unwrap_or(false)
}
