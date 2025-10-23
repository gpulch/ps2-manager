# 📥 Remote ISO Sources & Artwork API Setup Guide

## 🎨 Artwork API Configuration

### Current Setup: GameTDB (FREE - No API Key Required)

Your app currently uses **GameTDB**, which is **completely free** and requires **NO API key**. The service provides cover art for PlayStation 2 games automatically.

**URLs used:**
```
https://art.gametdb.com/ps2/cover2/{ID}.png
https://art.gametdb.com/ps2/cover2/US/{ID}.png
https://art.gametdb.com/ps2/cover2/EN/{ID}.png
https://art.gametdb.com/ps2/cover/{ID}.png
```

### Optional: Adding API Key Support (Future-proofing)

If you want to add API key support for other services or premium GameTDB features:

#### 1. Create `.env` file in `src-tauri/` folder:

```env
# Optional - GameTDB doesn't require this currently
GAMETDB_API_KEY=your_api_key_here

# For Archive.org (if they require authentication in future)
ARCHIVE_ORG_API_KEY=your_key_here
```

#### 2. Add `.env` to `.gitignore`:

```bash
# In src-tauri/.gitignore
.env
.env.local
```

#### 3. The code now supports optional API keys

The updated `metadata.rs` will automatically:
- Check for `GAMETDB_API_KEY` environment variable
- Append it to requests if present
- Work without it (current behavior)

---

## 📥 Remote ISO Sources Setup

### How It Works

The remote sources feature allows you to:
1. Browse game collections from Archive.org
2. Download ISOs directly to your library folder
3. Track download progress in real-time
4. Automatically scan downloaded games

### Backend (Already Implemented ✅)

The Rust backend now includes:
- `fetch_archive_org_games()` - Fetch game list from collection
- `download_remote_iso()` - Simple download
- `download_remote_iso_with_progress()` - Download with progress events
- `validate_remote_source()` - Check if URL is accessible

### Integration Steps

#### 1. Add Remote Sources to Library View

Update `src/pages/LibraryView.tsx`:

```tsx
import { RemoteSourcesPanel } from '../components/RemoteSourcesPanel'

// Add to the LibraryView component props:
scanCurrent={props.onRescan}

// Add this section after SourceControls:
<RemoteSourcesPanel 
  libraryRoot={props.libraryRoot}
  onDownloadComplete={props.onRescan}
/>
```

#### 2. Update Navigation to Include Remote Sources

Option A: Add as a tab in Library view
Option B: Create separate "Download" page

#### 3. Build and Test

```bash
# Build frontend
pnpm run build

# Build Tauri app
cd src-tauri
cargo build

# Run app
pnpm run tauri dev
```

### Usage Guide

#### For Users:

1. **Go to Settings** → Select a Library Folder
2. **Go to Library** → Find "Remote ISO Sources" section
3. **Enter Archive.org URL**:
   ```
   https://archive.org/download/playstation2_essentials
   ```
4. **Click "Fetch Games"** - Wait for game list to load
5. **Click "Download"** on any game
6. **Wait for download** - Progress bar shows status
7. **Game auto-scans** when download completes

### Popular Archive.org Collections

```
# PS2 Essentials
https://archive.org/download/playstation2_essentials

# PS2 Collection
https://archive.org/download/ps2_collection

# PS2 Games (Various)
https://archive.org/download/redump.ps2
```

### Features

✅ Real-time download progress
✅ Automatic game scanning after download
✅ Size validation
✅ Duplicate detection
✅ Error handling
✅ Resume support (via reqwest)

### Advanced Configuration

#### Custom Download Sources

To add other sources (not just Archive.org), update `remote.rs`:

```rust
#[tauri::command]
pub fn fetch_custom_source(url: String) -> Result<Vec<RemoteGame>, String> {
  // Your custom logic here
  // Parse HTML, JSON, or API response
  // Return list of RemoteGame
}
```

#### Download Location

Downloads go to your configured **Library Folder**. To change:

1. Go to **Settings**
2. Click **"Choose Library Folder"**
3. Select new location

#### Rate Limiting

To avoid overwhelming servers, add rate limiting in `remote.rs`:

```rust
use std::thread;
use std::time::Duration;

// Before download
thread::sleep(Duration::from_secs(1));
```

---

## 🔧 Troubleshooting

### Artwork Not Loading

1. Check internet connection
2. Verify game ID format (e.g., `SLUS_203.12`)
3. Try manual cover fetch in game details

### Download Fails

1. Verify library folder is writable
2. Check available disk space
3. Verify Archive.org URL is accessible
4. Check firewall settings

### Progress Not Updating

1. Make sure you're using `download_remote_iso_with_progress()`
2. Check event listeners are properly set up
3. Look for console errors

---

## 📚 API Reference

### Rust Commands

```rust
// Fetch games from Archive.org collection
fetch_archive_org_games(collection_url: String) -> Vec<RemoteGame>

// Download ISO (no progress)
download_remote_iso(
  download_url: String,
  destination_folder: String,
  file_name: String
) -> String

// Download ISO (with progress events)
download_remote_iso_with_progress(
  download_url: String,
  destination_folder: String,
  file_name: String,
  window: tauri::Window
) -> String

// Validate remote source
validate_remote_source(url: String) -> bool
```

### TypeScript Actions

```typescript
import { fetchArchiveOrgGames, downloadRemoteIsoWithProgress } from '../actions/remote'

// Fetch games
const games = await fetchArchiveOrgGames('https://archive.org/download/...')

// Download with progress
await downloadRemoteIsoWithProgress(downloadUrl, libraryFolder, fileName)

// Listen for progress
listen<DownloadProgress>('download-progress', (event) => {
  console.log(event.payload.percent + '%')
})
```

---

## 🚀 Next Steps

1. **Test the feature**: Download a small game first
2. **Add more sources**: Implement custom parsers for other sites
3. **Enhance UI**: Add filtering, sorting, search
4. **Add queue**: Download multiple games sequentially
5. **Add pause/resume**: Implement chunked downloads with resume support

---

## 📝 License & Legal

**Important**: Make sure you have the legal right to download and use ISO files. Archive.org hosts content under various licenses. Always verify the license before downloading.

---

## 🤝 Contributing

To add support for more remote sources:

1. Fork the repo
2. Add parser in `src-tauri/src/remote.rs`
3. Add UI in `src/components/`
4. Test thoroughly
5. Submit PR

---

**Questions?** Check the code comments or open an issue!
