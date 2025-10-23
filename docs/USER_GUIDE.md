# PS2 Manager User Guide

Complete guide for using PS2 Manager to manage your PlayStation 2 games with Open PS2 Loader.

---

## 🎮 Getting Started

### First Launch

1. **Launch PS2 Manager**
2. **Select your library folder** or plug in your OPL disk
3. **Scan for games** - The app will detect all ISO files
4. **Start managing!**

---

## 📁 Library Modes

### OPL Disk Mode
- Plug in your USB/HDD with OpenPS2Loader
- App auto-detects OPL folder structure
- Validates and auto-fixes missing folders
- Manages DVD/, CD/, ART/, CFG/, CHT/, VMC/

### Library Mode (No Disk)
- Manage games in any folder on your computer
- Perfect for organizing before transferring
- All features work the same way
- Separate folder for cheats if needed

---

## 🎯 Core Features

### 1. Game Catalog

**Scan Games:**
- Click "Scan" to find all ISO files
- Extracts Title IDs from filenames or SYSTEM.CNF
- Shows game size, type (CD/DVD), and cover art status
- Results are cached for instant loading

**Search & Filter:**
- Full-text search by title, ID, or filename
- Sort by name, size, or ID
- Ascending/descending order
- Real-time filtering

**Rename Games:**
- Click "Preview Renames"
- See proposed changes: `ID - Title.iso`
- 80 character limit (enforced)
- Click "Apply" to rename all at once

**Export Catalog:**
- Export game list to JSON
- Useful for backups or sharing
- Includes all game metadata

### 2. Cover Art

**Auto-Fetch:**
- Click "Auto-Fetch Missing"
- Downloads covers from GameTDB
- Shows progress for each game
- Covers saved as `ID.png` in ART folder

**Manual Import:**
- Click "Import" on any game
- From URL or local file
- Automatically resizes and converts to PNG
- Replaces existing cover

**Delete & Re-fetch:**
- Delete covers you don't like
- Re-fetch to try again
- Covers are cached locally

### 3. Remote Downloads

**Browse Archive.org:**
- Click "Remote Sources"
- Browse PS2 game collections
- See game name, size, and format
- Download directly to your library

**Download Games:**
- Click "Download" on any game
- Real-time progress bar
- UI stays responsive (download in background)
- Auto-scans after download completes

**Security:**
- HTTPS only (encrypted downloads)
- Domain whitelist (archive.org only)
- File validation (ensures complete downloads)
- Auto-cleanup if download fails

### 4. Cheats Manager

**Load Cheats:**
- Select game by ID
- Load existing CHT file
- Edit cheats in text area
- Save changes

**Import/Export:**
- Import CHT files from external sources
- Export cheats to share with others
- Bulk operations supported

**Validation:**
- Format checking (warns about issues)
- Master code detection
- Line count warnings (>250 codes)

**Learn More:** See [CHEATS_GUIDE.md](CHEATS_GUIDE.md) for complete documentation.

### 5. VMC Manager

**List VMCs:**
- Shows all .vmc files in VMC folder
- Displays size and last modified date

**Import:**
- Add VMC files from external sources
- Auto-renames if file already exists

**Export:**
- Backup VMC files to other locations
- Preserves original files

**Delete:**
- Remove unwanted VMC files
- Confirmation required

### 6. CD/DVD Organization

**Auto-Organize:**
- Click "Preview" to see proposed moves
- Games ≤800 MB → CD folder
- Games >800 MB → DVD folder
- Shows which files will move

**Apply:**
- Click "Apply" to move all files
- Preserves filenames
- Updates catalog automatically

### 7. Duplicate Detector

**Scan for Duplicates:**
- Detects games with same Game ID
- Groups duplicates together
- Calculates wasted space

**Review:**
- Expand groups to see all copies
- See filename and size for each
- Identify which to keep/delete

**Cleanup:**
- Delete duplicate copies
- First copy is kept by default
- Free up disk space

### 8. Backup & Restore

**Create Backup:**
- Click "Create Backup"
- Choose save location
- Exports catalog + settings to JSON

**Restore:**
- Click "Restore"
- Select backup file
- Preview backup info before restoring

**What's Backed Up:**
- Game catalog (titles, IDs, metadata)
- App settings
- Library paths

**What's NOT Backed Up:**
- ISO files (too large)
- Cover art images (too large)

---

## 🔒 Security Features

### Download Protection
- ✅ HTTPS only (encrypted)
- ✅ Domain whitelist (archive.org only)
- ✅ Path validation (prevents attacks)
- ✅ File size limits (1 MB - 10 GB)
- ✅ Content verification
- ✅ Auto-cleanup on failure

### File Safety
- ✅ Filename sanitization (removes dangerous characters)
- ✅ Path traversal prevention
- ✅ Validation before operations
- ✅ Error messages hide system paths

**Learn More:** See [SECURITY_GUIDE.md](SECURITY_GUIDE.md)

---

## 💡 Tips & Tricks

### Performance
- **Cache is king:** First scan is slow, subsequent loads are instant
- **Search is fast:** Search 1000s of games in milliseconds
- **Downloads:** UI never freezes, keep working during downloads

### Organization
- **Consistent naming:** Use "Preview Renames" for clean filenames
- **CD vs DVD:** Use auto-organize to keep folders clean
- **Covers:** Fetch all at once with "Auto-Fetch Missing"

### Storage
- **Find duplicates:** Use duplicate detector to reclaim space
- **Backup regularly:** Create backups before major changes
- **Clean up:** Delete games you don't play anymore

---

## ⚠️ Troubleshooting

### App won't start
- Check system requirements (macOS 10.15+, Windows 10+, Ubuntu 20.04+)
- Try running as administrator/with permissions

### Can't scan games
- Verify folder contains .iso files
- Check folder permissions (read access required)
- Try selecting folder again

### Download fails
- Check internet connection
- Verify archive.org is accessible
- File might be too large (10 GB limit)
- Try again (might be temporary issue)

### Covers won't download
- Check internet connection
- Game might not be in GameTDB database
- Try manual import instead

### Cheats don't work in OPL
- Verify CHT file is in CHT folder
- Filename must match game ID: `SLUS_123.45.cht`
- Enable cheats in OPL settings
- Some games don't support cheats

---

## 📋 Keyboard Shortcuts

_(Coming soon in future update)_

---

## 🆘 Get Help

**Something not working?**
1. Check this guide
2. Read the main [README](../README.md)
3. Search [existing issues](https://github.com/YOUR_USERNAME/ps2-manager/issues)
4. Create a [new issue](https://github.com/YOUR_USERNAME/ps2-manager/issues/new)

---

**Happy gaming! 🎮**
