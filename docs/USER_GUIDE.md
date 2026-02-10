## User Guide — PS2 Manager

Concise usage guide (OPL + library mode).

### Getting started
1) Launch the app.  
2) Pick your Library folder or plug your OPL disk.  
3) Run **Scan** to detect ISOs.  
4) Start managing (rename, covers, cheats, downloads).

### Library modes
- **OPL disk mode:** Auto-detects/validates `DVD/`, `CD/`, `ART/`, `CFG/`, `CHT/`, `VMC/`; fixes missing folders.  
- **Library mode:** Works on any folder (organize locally, then transfer). Cheats folder can be separate.

### Core flows (short)
- **Catalog:** Scan → search/filter → sort → export JSON.  
- **Rename:** Preview → apply `ID - Title.iso` (≤80 chars).  
- **Covers:** Auto-Fetch Missing; manual import (URL/file) resizes to PNG; delete/re-fetch.  
- **Remote downloads:** Browse Archive.org, download with progress, auto-scan on completion (HTTPS, whitelist, validation).  
- **Cheats:** Load/edit/save `.cht`; import/export; validation and master code checks.  
- **VMC:** List, import/export, delete.  
- **Organize CD/DVD:** Preview moves (≤800 MB → CD), then apply.  
- **Duplicates:** Detect by Game ID, review, delete extras.  
- **Backup/restore:** Export/import catalog + settings (JSON); ISOs/covers not included.

### Security basics
- HTTPS-only remote downloads; archive.org whitelist.  
- Size limits and integrity checks; cleanup on failure.  
- Filename/path sanitization to prevent traversal.

### Quick troubleshooting
- Not detecting games: verify `.iso` presence and permissions.  
- Covers fail: check network; game may be missing in GameTDB.  
- Downloads fail: network/disk space/10 GB limit.  
- Cheats fail: file named with Game ID in `CHT/`; enable cheats in OPL.

### Tips
- Use rename preview for clean filenames.  
- Fetch covers in batch.  
- Run duplicate detector to reclaim space.  
- Back up before big changes.

Help: see README or open an issue on GitHub.
