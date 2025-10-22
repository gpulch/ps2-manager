# PS2 Manager (OPL) — Tauri + React + TypeScript

Desktop app (macOS/Windows) to manage PlayStation 2 game catalog, saves and cheats for Open PS2 Loader (OPL), including exFAT (e.g. GrimDoomer builds). Focus: maintainability, cross‑platform, and a clean workflow.

## Prerequisites
- **Node.js** 20+ and **pnpm** 9+ (corepack recommended)
- **Rust** (stable via rustup) and **Xcode CLT** on macOS
- No Windows machine required for dev; Windows builds via CI later

## Quick start
```bash
pnpm install
pnpm run tauri:dev
```

## What it does today (MVP)
- **OPL disk detection**: `suggest_opl_roots()` scans macOS `/Volumes/*` (also handles `*/OpenPS2Loader`).
- **Structure validator + fixer**: `validate_opl_dir(path)`, `fix_opl_structure(path)` for `DVD/`, `CD/`, `ART/`, `CFG/`, `CHT/`, `VMC/`.
- **Game scan (ISO)**: `scan_opl_games(opl_root)` lists `.iso` under `DVD/` et `CD/`.
  - Extracts Title ID from filename (e.g. `SLUS_203.12`) then from `SYSTEM.CNF` inside the ISO (pure Rust), fallback to ISO head heuristics.
  - Infers a title guess from filename and detects presence of `ART/<ID>.png`.
- **Renaming (<=80 chars)**: preview and apply. Template: `ID - Title.iso` (ASCII‑safe, truncation to 80 chars).
- **Covers import**: save a cover as `ART/<ID>.png` from an image URL (PNG re‑encode) or local file.
- **Covers auto‑fetch**: try multiple known cover URLs by ID variants; batch auto‑fetch missing covers.
- **NoSQL storage**: `@tauri-apps/plugin-store` for small app state (e.g. last used root).
- **VMC manager**: list, import, and export files from `VMC/`.
- **VMC delete**: remove VMC files from `VMC/`.
- **Cheat manager (backend)**: load/save `.CHT` per game ID in `CHT/`.
- **Cheat import/export**: import existing `.CHT` to `CHT/` and export `.CHT` for a given Game ID.
- **Organizer (CD/DVD)**: preview and apply moves between `CD/` and `DVD/` based on size threshold (≤800 MiB → `CD/`).
- **Catalog caching**: stores last scan per root and shows it instantly on launch; one-click rescan.
- **Export catalog**: export the current catalog to a JSON file.

## Roadmap (next)
- Harden the `SYSTEM.CNF` parser to support larger directories and edge cases.
- Metadata providers (free/low‑friction first), cache, and manual overrides.
- Cheats (`.CHT`) editor and converters; VMC manager.
- BIN/CUE → ISO conversion; CDDA detection/warnings.
- CI (macOS/Windows), packaging/signature, auto‑update.

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

## Architecture (backend)
- `src-tauri/src/opl.rs` — root detection, validation, fix
- `src-tauri/src/scanner.rs` — ISO scan + ID/title heuristics
- `src-tauri/src/naming.rs` — rename preview/apply (80‑char limit)
- `src-tauri/src/covers.rs` — cover import from URL/file → `ART/<ID>.png`
- `src-tauri/src/lib.rs` — Tauri builder, plugins, commands registration

## Notes & limitations
- ISO scan currently heuristically reads the ISO head to find an ID; a full ISO9660 `SYSTEM.CNF` parser will replace this.
- Windows support will be built and verified in CI (dev here is macOS‑only).
- Store permissions are enabled via capabilities; network access is done by Rust (`reqwest`).

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
