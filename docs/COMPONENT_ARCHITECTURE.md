# Component Architecture

Clean, organized component structure for PS2 Manager.

---

## 📁 Directory Structure

```
src/components/
├── index.ts                    # Central export file
│
├── layout/                     # Layout components
│   ├── AppHeader.tsx          # Main application header with logo
│   ├── AppHeader.css          # Header styles
│   ├── AppFooter.tsx          # Application footer
│   ├── AppFooter.css          # Footer styles
│   ├── Header.tsx             # PS2 branding header
│   ├── NavBar.tsx             # Main navigation
│   └── PageLayout.tsx         # Page wrapper layout
│
├── features/                   # Feature-specific components
│   ├── SettingsPanel.tsx      # App settings
│   ├── OplRoots.tsx           # OPL root selection
│   ├── ValidationPanel.tsx    # Disk validation
│   ├── SourceControls.tsx     # Source management
│   │
│   ├── cheats/                # Cheat management
│   │   └── CheatsPanel.tsx
│   │
│   ├── covers/                # Cover art
│   │   └── CoverTools.tsx
│   │
│   ├── vmc/                   # VMC management
│   │   └── VmcPanel.tsx
│   │
│   ├── organizer/             # CD/DVD organization
│   │   └── OrganizerPanel.tsx
│   │
│   ├── remote/                # Remote downloads
│   │   └── RemoteSourcesPanel.tsx
│   │
│   ├── duplicates/            # Duplicate detection
│   │   └── DuplicateManager.tsx
│   │
│   └── backup/                # Backup system
│       └── BackupManager.tsx
│
├── shared/                     # Reusable components
│   ├── GamesTable.tsx         # Game list table
│   ├── GamesSection.tsx       # Game section wrapper
│   ├── SearchBar.tsx          # Search component
│   ├── RenamePreview.tsx      # Rename preview
│   ├── ErrorBoundary.tsx      # Error handling
│   ├── LoadingSpinner.tsx     # Loading indicator
│   ├── LoadingOverlay.tsx     # Full-screen loading
│   ├── ProgressBar.tsx        # Progress bar
│   ├── SecurityInfo.tsx       # Security badge
│   └── Toast.tsx              # Toast notifications
│
└── ui/                         # UI building blocks
    ├── FeatureCard.tsx        # Feature display card
    ├── FeatureCard.css        # Card styles
    ├── StatCard.tsx           # Statistics card
    └── StatCard.css           # Stat card styles
```

---

## 🎯 Design Principles

### 1. Separation of Concerns

**Layout Components** (`layout/`)
- Control app-level structure
- Header, footer, navigation
- Page wrappers and scaffolding

**Feature Components** (`features/`)
- Domain-specific functionality
- Self-contained features
- Organized by feature area

**Shared Components** (`shared/`)
- Used across multiple features
- Reusable utilities
- Common UI patterns

**UI Components** (`ui/`)
- Pure presentational
- Highly reusable
- No business logic

### 2. Import Patterns

**From layout components:**
```typescript
import { Button } from '../../ui/Button'
import { useNav } from '../../contexts/NavContext'
```

**From feature components (nested):**
```typescript
import { Button } from '../../../ui/Button'
import { invoke } from '@tauri-apps/api/core'
import { ProgressBar } from '../../shared/ProgressBar'
```

**From shared components:**
```typescript
import { Button } from '../../ui/Button'
import type { GameInfo } from '../../types'
```

### 3. Central Export (`index.ts`)

All components exported from single file:

```typescript
import { AppHeader, NavBar, CheatsPanel, SearchBar } from './components'
```

Benefits:
- Single import source
- Easy to refactor
- Clear API surface
- Auto-complete friendly

---

## 📦 Component Categories

### Layout Components
**Purpose:** App-level structure and navigation

| Component | Description |
|-----------|-------------|
| AppHeader | Main header with PS2 logo and branding |
| AppFooter | Footer with links and info |
| Header | PS2/Sony logos header |
| NavBar | Main navigation tabs |
| PageLayout | Consistent page wrapper |

### Feature Components
**Purpose:** Domain-specific functionality

| Feature | Component | Description |
|---------|-----------|-------------|
| Cheats | CheatsPanel | Cheat management |
| Covers | CoverTools | Cover art operations |
| VMC | VmcPanel | Memory card management |
| Organizer | OrganizerPanel | CD/DVD organization |
| Remote | RemoteSourcesPanel | ISO downloads |
| Duplicates | DuplicateManager | Duplicate detection |
| Backup | BackupManager | Backup/restore |

### Shared Components
**Purpose:** Reusable across features

| Component | Use Case |
|-----------|----------|
| GamesTable | Display game lists |
| SearchBar | Search functionality |
| ProgressBar | Show progress |
| LoadingSpinner | Loading state |
| ErrorBoundary | Error handling |
| Toast | Notifications |

### UI Components
**Purpose:** Pure presentation

| Component | Use Case |
|-----------|----------|
| FeatureCard | Feature showcase |
| StatCard | Statistics display |

---

## 🔨 Adding New Components

### 1. Determine Category

**Is it layout?** → `layout/`  
**Is it feature-specific?** → `features/{feature}/`  
**Is it reusable?** → `shared/`  
**Is it pure UI?** → `ui/`

### 2. Create Component

```typescript
// src/components/features/my-feature/MyComponent.tsx
export const MyComponent = () => {
  // Implementation
}
```

### 3. Add to index.ts

```typescript
export { MyComponent } from './features/my-feature/MyComponent'
```

### 4. Use Anywhere

```typescript
import { MyComponent } from '../components'
```

---

## 🎨 Styling Patterns

### Co-located CSS
```
components/
├── ui/
│   ├── FeatureCard.tsx
│   └── FeatureCard.css       ← CSS file next to component
```

### Import in Component
```typescript
import './FeatureCard.css'
```

### Global Styles
```
src/
├── App.css                    ← Global styles
├── index.css                  ← Reset/base styles
└── ui/
    ├── theme.css              ← Theme variables
    └── ui.css                 ← UI utilities
```

---

## 📊 Benefits of This Structure

### Scalability
- ✅ Easy to add new features
- ✅ Clear where components belong
- ✅ Features are isolated

### Maintainability
- ✅ Easy to find components
- ✅ Clear dependencies
- ✅ Self-documenting structure

### Developer Experience
- ✅ Single import source
- ✅ Auto-complete works well
- ✅ Logical organization

### Performance
- ✅ Tree-shaking friendly
- ✅ Code-splitting ready
- ✅ Lazy loading supported

---

## 🔄 Migration Guide

If you have old imports, update them:

### Old Structure
```typescript
import { CheatsPanel } from '../components/CheatsPanel'
import { SearchBar } from '../components/SearchBar'
```

### New Structure
```typescript
import { CheatsPanel } from '../components/features/cheats/CheatsPanel'
import { SearchBar } from '../components/shared/SearchBar'
```

### Or use central export
```typescript
import { CheatsPanel, SearchBar } from '../components'
```

---

## 📝 Best Practices

### 1. Keep Components Focused
- Single responsibility
- Small and composable
- Easy to test

### 2. Use Proper Imports
- Relative imports within components
- Central export for external use
- Type-only imports when needed

### 3. Organize by Feature
- Group related components
- Keep feature code together
- Minimize cross-feature dependencies

### 4. Share Wisely
- Only move to `shared/` when truly reusable
- Don't prematurely abstract
- Keep it simple

---

## 🎯 Future Improvements

### Potential Additions
- `components/forms/` - Form components
- `components/modals/` - Modal dialogs
- `components/tables/` - Table components
- `components/animations/` - Animated components

### Potential Refactoring
- Extract common hooks from components
- Create compound components for complex UIs
- Add Storybook for component documentation

---

**Clean architecture = Happy developers!** 🎨✨
