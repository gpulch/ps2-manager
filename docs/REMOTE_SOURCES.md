## Remote Sources — quick guide

Remote downloads (Archive.org) and cover fetching summary.

### Covers (GameTDB)
- Uses GameTDB (free, no API key) with multiple fallback URLs for regions.
- Covers saved as `ART/<GAME_ID>.png`.

### Remote ISO downloads (Archive.org)
1. Open **Remote Sources** in the app.  
2. Enter an Archive.org collection URL (example below).  
3. Fetch games → choose **Download**.  
4. Progress is shown; on completion the game is auto-scanned.

Examples:  
- `https://archive.org/download/playstation2_essentials`  
- `https://archive.org/download/ps2_collection`  
- `https://archive.org/download/redump.ps2`

### Safety
- HTTPS + archive.org whitelist.  
- Download size limits and integrity checks.  
- Auto-cleanup on failure; sanitized errors.

### Troubleshooting
- Downloads fail: check network, disk space, and size limit (<10 GB).  
- Progress not updating: ensure Remote Sources panel is open and app stays running.  
- Covers missing: verify Game ID (e.g., `SLUS_203.12`) and try manual fetch.

### Notes
- Downloads go to your configured Library folder (set in Settings).  
- Keep within legal use; verify rights before downloading.
