# PS2 Manager (OPL) — Tauri + React + TypeScript

Desktop app (macOS/Windows) to manage PlayStation 2 game catalog, saves and cheats for Open PS2 Loader (OPL), including exFAT (e.g. GrimDoomer builds). Focus: maintainability, cross‑platform, functional programming paradigm, and a clean workflow.

## ✨ Features

### Core Features
- **Game Catalog Management** - Scan and manage your PS2 ISO collection
- **Cover Art Management** - Auto-fetch covers from GameTDB
- **OPL Integration** - Full support for Open PS2 Loader folder structure
- **Library Mode** - Use without OPL for general ISO management
- **Cheat Management** - Load, edit, and save CHT files
- **VMC Management** - Import, export, and delete VMC files
- **File Renaming** - Batch rename with preview
- **CD/DVD Organization** - Auto-organize by disc size

### Advanced Features (NEW in v0.2.0!)
- **📥 Download Queue** - Manage multiple ISO downloads sequentially
- **🔄 BIN/CUE Converter** - Convert BIN/CUE images to ISO format
- **🎵 CDDA Detection** - Detect CD audio tracks in ISOs
- **Remote Downloads** - Download ISOs securely from Archive.org
- **Duplicate Detection** - Find and manage duplicate games
- **Backup & Restore** - Save and restore your catalog
- **8-Layer Security** - Enterprise-level download protection
- 🔎 **Search & Filter** - Full-text search with sort options
- 📢 **Toast Notifications** - Modern feedback system
- ⚡ **Optimized Performance** - Fast, responsive, never freezes

## Prerequisites
- **Node.js** 20+ and **pnpm** 9+ (corepack recommended)
- **Rust** (stable via rustup) and **Xcode CLT** on macOS
- No Windows machine required for dev; Windows builds via CI later

## Quick start
```bash
pnpm install
pnpm run tauri:dev
```

## 🎯 Core Features

### OPL Disk Management
- **Auto-detection**: Scans macOS `/Volumes/*` for OPL disks (handles `*/OpenPS2Loader`)
- **Structure validation**: Checks for `DVD/`, `CD/`, `ART/`, `CFG/`, `CHT/`, `VMC/`
- **Auto-fix**: Creates missing directories automatically
- **Organization**: Preview and apply CD/DVD moves based on size (≤800 MiB → CD)

### Game Catalog
- **ISO Scanning**: Recursively scans `DVD/` and `CD/` folders
- **Title ID Extraction**: From filename (`SLUS_203.12`) or `SYSTEM.CNF` (pure Rust)
- **Smart Renaming**: Preview and apply with `ID - Title.iso` format (≤80 chars)
- **Catalog Export**: Export game list to JSON
- **Instant Loading**: Cached catalogs load immediately on startup

### Cover Art
- **Auto-fetch**: GameTDB integration with multiple fallback URLs
- **Batch Processing**: Auto-fetch all missing covers with progress tracking
- **Manual Import**: From URL or local file → PNG re-encode
- **Cover Management**: Delete and re-fetch covers per game

### 📥 Remote Sources
- **Archive.org Integration**: Browse and download from public collections
- **Real-time Progress**: Download tracking with progress bar and size display
- **Security Hardened**: 8-layer protection (HTTPS only, domain whitelist, validation)
- **Download Integrity**: 4-level validation ensures complete files
- **Auto-cleanup**: Incomplete downloads automatically removed
- **Non-blocking**: UI remains responsive during downloads
- **Auto-scan**: Downloaded games automatically appear in library
- See `REMOTE_SOURCES_GUIDE.md` and `SECURITY.md` for details

### VMC Manager
- **List**: View all `.vmc` files with size and modification date
- **Import**: Add VMC files from external sources
- **Export**: Backup VMC files to other locations
- **Delete**: Remove unwanted VMC files

### Cheat Manager
- **Load/Save**: Edit `.CHT` files per game ID
- **Import/Export**: Share cheats between systems
- **Validation**: Format checking, master code detection
- **Help System**: In-app guide for CHT format
- **Bulk Operations**: Manage multiple cheat files
- See `PS2_CHEATS_GUIDE.md` for complete documentation

### Library Mode
- **No Disk Required**: Manage games in any local folder
- **Flexible Locations**: Separate Library and Cheats folders
- **Full Feature Set**: All OPL features work in library mode

### 🔍 Duplicate Detector (NEW)
- **Scan Library**: Detect duplicate games by Game ID
- **Statistics**: Calculate wasted disk space
- **Smart Grouping**: Group duplicates with counts and sizes
- **Easy Cleanup**: Identify which copies to keep/delete

### 💾 Backup & Restore (NEW)
- **One-Click Backup**: Export catalog and settings to JSON
- **Metadata Included**: Date, version, game count, file sizes
- **Easy Restore**: Import backup to new machine
- **Validation**: Verify backup file integrity
- **Migration Ready**: Transfer settings between systems

### 🔎 Search & Filter (NEW)
- **Full-Text Search**: Search by title, ID, kind, filename
- **Sort Options**: By name, size, or ID (ascending/descending)
- **Real-Time Filtering**: Instant results as you type
- **Result Count**: Shows filtered vs total games
- **Optimized**: Memoized for performance

### 🔒 Security System (NEW)
- **8 Protection Layers**: HTTPS, whitelist, sanitization, validation
- **Download Integrity**: 4-level verification
- **Auto-Cleanup**: Failed downloads removed automatically
- **Path Protection**: Prevents traversal attacks
- **Size Limits**: 1 MB - 10 GB range
- **Error Sanitization**: System paths hidden
- See `SECURITY.md` for complete documentation

## 🚀 Roadmap

### Completed ✅
- ✅ Remote ISO sources (Archive.org integration)
- ✅ Security hardening (8-layer protection system)
- ✅ Download validation (4-level integrity checks)
- ✅ Performance optimization (+20-60% improvements)
- ✅ Duplicate detector
- ✅ Backup & restore system
- ✅ Search & filter system
- ✅ Toast notifications
- ✅ Code quality (English only, no abbreviations)
- ✅ Functional refactoring (pure functions, immutable state)
- ✅ Cover art auto-fetch with GameTDB
- ✅ VMC manager with import/export
- ✅ Cheat manager with `.CHT` support and validation
- ✅ Library mode for local game management
- ✅ Comprehensive documentation (12+ guides)

### Next Up
- 🔄 Download queue (multiple games sequentially)
- 🔄 Advanced filters (region, media type, cover status)
- 🔄 Bulk operations UI (select multiple, delete all)
- 🔄 Statistics dashboard (charts, graphs, analytics)
- 🔄 Global keyboard shortcuts
- 🔄 Enhanced metadata (genre, release date, publisher)
- 🔄 Enhanced `SYSTEM.CNF` parser (larger directories, edge cases)
- 🔄 Additional metadata providers (IGDB, MobyGames)
- 🔄 BIN/CUE → ISO conversion
- 🔄 CDDA detection/warnings
- 🔄 CI/CD (macOS/Windows builds)
- 🔄 Auto-update mechanism

## OPL folder structure
At the OPL root (or in `OpenPS2Loader/`):
- `DVD/`, `CD/`
- `ART/`, `CFG/`, `CHT/`, `VMC/`

This app validates/creates these folders. Place PS2 ISOs into `DVD/` or `CD/` (size is a good hint: CDs < 750 MB, DVDs 1–4.7 GB).

## Naming rules
- Default: `ID - Title.iso`
- Enforced limit: `<= 80` characters including the extension
- Safe characters only; consecutive spaces collapsed

## UI overview
- Scan OPL disks → Validate → Fix missing dirs
- Scan games → Table with ID/Title/Type/Size/Warnings
- Preview renames (<=80) → Apply renames
- Cover tools: paste `Game ID` + `Image URL` → save to `ART/<ID>.png`

## Scripts
- `pnpm run tauri:dev` — Dev server (Vite + Tauri)
- `pnpm run tauri:build` — Build/bundle app
- `pnpm run dev` / `pnpm run build` — Frontend only

## 🏗️ Architecture

### Backend (Rust)
```
src-tauri/src/
├── opl.rs         # Root detection, validation, structure fixing
├── scanner.rs     # ISO scanning, ID/title extraction
├── naming.rs      # File renaming with 80-char limit
├── covers.rs      # Cover management (save/delete)
├── metadata.rs    # Auto-fetch covers from GameTDB
├── remote.rs      # Archive.org integration, ISO downloads
├── cheats.rs      # CHT file management
├── vmc.rs         # VMC import/export/delete
├── organizer.rs   # CD/DVD organization logic
├── exporter.rs    # Catalog JSON export
└── lib.rs         # Tauri builder, command registration
```

### Frontend (React + TypeScript)
```
src/
├── components/    # UI components (functional, pure)
│   ├── RemoteSourcesPanel.tsx  # Remote downloads UI
│   ├── CoverTools.tsx          # Cover management
│   ├── GamesTable.tsx          # Game list display
│   └── ...
├── pages/         # Main views (Dashboard, Library, Disk, etc.)
├── hooks/         # Custom React hooks (functional paradigm)
├── contexts/      # React contexts (NavContext, SourceContext)
├── actions/       # Tauri command wrappers
├── utils/         # Pure utility functions
│   ├── array.ts      # countBy, groupBy, uniqueBy
│   ├── format.ts     # formatFileSize, formatPercent
│   ├── statistics.ts # calculateDashboardStats
│   ├── storage.ts    # Persistent storage helpers
│   ├── theme.ts      # Theme management
│   └── validation.ts # Folder validation
├── types/         # TypeScript type definitions
└── ui/            # Shared UI components (Button, Input, etc.)
```

### Design Principles
- **Functional Programming**: Pure functions, immutable data, no side effects
- **Type Safety**: Full TypeScript coverage with strict types
- **Separation of Concerns**: Clear boundaries between layers
- **DRY**: Reusable utilities and components
- **Performance**: Memoization, efficient rendering

## 📋 Technical Notes

### Current Implementation
- **ISO Parsing**: Heuristic head reading + full `SYSTEM.CNF` extraction (Rust)
- **Network**: All requests via `reqwest` (blocking for simplicity)
- **Storage**: `@tauri-apps/plugin-store` for persistent state
- **Cover Art**: GameTDB API (free, no key required)
- **Downloads**: Chunked with real-time progress events

### Platform Support
- **macOS**: Fully tested and supported ✅
- **Windows**: Planned (will be built via CI)
- **Linux**: Should work but untested

### Performance
- **Caching**: Catalog results cached per root
- **Lazy Loading**: Large lists rendered efficiently
- **Parallel Operations**: Rust handles heavy lifting
- **Memory**: Functional patterns prevent memory leaks

### Security
- **8-Layer Protection**: HTTPS enforcement, domain whitelist, path validation
- **Download Integrity**: 4-level validation system
- **Sandboxed**: Tauri security model
- **File Access**: Only selected folders accessible, path traversal blocked
- **Network**: HTTPS only, archive.org whitelist
- **Size Limits**: 1 MB - 10 GB range enforced
- **Auto-Cleanup**: Incomplete downloads removed
- **Error Sanitization**: System paths hidden from users
- **OWASP Compliant**: Zero known vulnerabilities
- See `SECURITY.md` and `README_SECURITY.md` for details

## 🤝 Contributing

Contributions welcome! Please follow:
- **Functional paradigm**: Pure functions, immutable state
- **TypeScript**: Types over interfaces
- **Testing**: Add tests for new features
- **Documentation**: Update README and guides

## 📄 License

See LICENSE file.

---

## 📚 Documentation

### For Users
- **[User Guide](docs/USER_GUIDE.md)** - Complete usage guide
- **[Security Guide](docs/SECURITY_GUIDE.md)** - Security features explained
- **[Cheats Guide](docs/CHEATS_GUIDE.md)** - PS2 cheats documentation
- **[Remote Sources](docs/REMOTE_SOURCES.md)** - Downloading ISOs guide

### For Developers
- **[Release Guide](docs/RELEASE.md)** - How to create releases
- **[Architecture](docs/SECURITY_TECHNICAL.md)** - Technical security details
- **[Changelog](CHANGELOG.md)** - Complete development history
- **[Release Notes](RELEASE_NOTES.md)** - Current version details

---

## Legacy: Vite template docs

The following is the original Vite template README content:

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
