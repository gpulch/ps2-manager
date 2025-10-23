# Quick Reference Guide

Fast lookup for common tasks in PS2 Manager.

---

## 🎮 Common Tasks

### Add Games to Library
1. Click **"Scan"** button
2. Select your library folder or OPL disk
3. Wait for scan to complete
4. Games appear in catalog

### Download ISOs
1. Go to **Library** tab
2. Click **"Remote Sources"**
3. Browse available games
4. Click **"Add to Queue"** for multiple downloads
5. Downloads start automatically

### Fetch Cover Art
1. In game catalog, click **"Auto-Fetch Missing"**
2. Wait for downloads (shows progress)
3. Covers appear automatically

### Manage Cheats
1. Go to **Cheats** tab
2. Enter game ID (e.g., SLUS_123.45)
3. Load existing or create new
4. Edit and save

### Convert BIN/CUE
1. Go to **Tools** tab
2. Click **"BIN/CUE Converter"**
3. Browse for .cue file
4. Click **"Convert to ISO"**

### Check for Audio Tracks
1. Go to **Tools** tab
2. Click **"CDDA Detection"**
3. Browse for .iso file
4. Click **"Detect Audio Tracks"**

---

## ⌨️ Keyboard Shortcuts (Coming Soon)

Current version uses mouse/touch only. Keyboard shortcuts planned for v0.3.0.

---

## 🔧 Settings

### Library Root
- Path to your game folder
- Can be external drive
- OPL disk auto-detected

### Cheats Root
- Separate folder for CHT files
- Optional (can use library folder)

### Theme
- Accent color customization
- Font size adjustment
- Dark mode only (for now)

---

## 📁 File Locations

### Library Structure (OPL)
```
/OPL/
├── DVD/          # DVD-sized games (>800 MB)
├── CD/           # CD-sized games (≤800 MB)
├── ART/          # Cover art (ID.png)
├── CFG/          # Game configs
├── CHT/          # Cheat files (ID.cht)
└── VMC/          # Memory cards (.vmc)
```

### Library Mode
```
/YourFolder/
├── game1.iso
├── game2.iso
└── covers/       # Optional cover art folder
```

---

## 🎯 Game ID Format

**Standard:** `SLUS_123.45` or `SCES_123.45`

**Variations:**
- US: SLUS, SCUS
- Europe: SCES, SLES
- Japan: SCPS, SLPS, SLPM

**File naming:** `SLUS_123.45 - Game Title.iso`

---

## 💡 Tips & Tricks

### Performance
- Keep library on SSD for faster scanning
- Use "Library Mode" if no OPL disk
- Enable auto-fetch for batch cover downloads

### Organization
- Use "Preview Renames" before applying
- Run "CD/DVD Organization" after adding games
- Check for duplicates regularly

### Downloads
- Queue multiple downloads at once
- Downloads continue in background
- Cancel/retry any download

### Covers
- 300x400 recommended resolution
- PNG format preferred
- Filename must match game ID

---

## ⚠️ Troubleshooting

### Games Not Found
- Check folder contains .iso files
- Verify permissions (read access)
- Try "Validate Folder" first

### Covers Not Downloading
- Check internet connection
- Game might not be in database
- Try manual import instead

### OPL Not Detecting
- Verify OPL folder structure
- Run "Fix Structure"
- Check permissions (write access)

### Downloads Fail
- Check internet connection
- Verify archive.org is accessible
- File might be too large (10 GB limit)
- Try again later

---

## 🔒 Security

### Safe Operations
- Scanning folders
- Fetching covers
- Managing cheats
- Renaming files
- Exporting catalogs

### Secure Downloads
- HTTPS only
- Domain whitelist active
- File validation enabled
- Auto-cleanup on failure

### What's Blocked
- Non-HTTPS URLs
- Unknown domains
- Path traversal attempts
- Suspicious filenames
- Files outside library

---

## 📊 File Size Limits

- **Minimum:** 1 MB (prevents corrupted files)
- **Maximum:** 10 GB (typical PS2 DVD max ~8.5 GB)
- **Covers:** No limit (typically <1 MB)
- **Cheats:** No limit (typically <100 KB)

---

## 🎨 Supported Formats

### Game Images
- ✅ ISO (recommended)
- ✅ BIN/CUE (convert to ISO first)
- ❌ CSO (not supported by OPL)
- ❌ ZIP/7Z (must extract first)

### Covers
- ✅ PNG (recommended)
- ✅ JPG/JPEG (converted to PNG)
- ✅ WebP (converted to PNG)

### Cheats
- ✅ CHT files (PCSX2/OPL format)
- ❌ Other formats not supported

---

## 📱 Platform Support

### macOS
- Version: 10.15+ (Catalina)
- Architectures: Intel + Apple Silicon
- Format: DMG installer

### Windows
- Version: Windows 10+
- Architecture: x64
- Format: EXE + MSI installer

### Linux
- Distribution: Ubuntu 20.04+
- Architecture: x64
- Format: DEB + AppImage

---

## 🔄 Update Process

1. Check for updates on GitHub
2. Download latest release
3. Install over existing version
4. Settings are preserved
5. Library data is preserved

---

## 💾 Backup & Restore

### What's Backed Up
- Game catalog (metadata)
- App settings
- Library paths

### What's NOT Backed Up
- ISO files (too large)
- Cover images (too large)
- Cheat files (manage separately)

### How to Backup
1. Click **"Create Backup"**
2. Choose save location
3. File saved as JSON

### How to Restore
1. Click **"Restore"**
2. Select backup file
3. Preview before restoring
4. Click **"Apply"**

---

## 🆘 Get Help

**Documentation:** `/docs` folder  
**User Guide:** `docs/USER_GUIDE.md`  
**Issues:** GitHub Issues  
**Discussions:** GitHub Discussions

---

## 🚀 Quick Start Checklist

For new users:

- [ ] Install PS2 Manager
- [ ] Select library folder
- [ ] Scan for games
- [ ] Fetch cover art
- [ ] Organize CD/DVD
- [ ] Check for duplicates
- [ ] Create backup
- [ ] Start playing!

---

**Happy gaming!** 🎮✨
