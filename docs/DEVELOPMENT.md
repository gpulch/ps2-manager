# Development Guide

Complete guide for developers working on PS2 Manager.

---

## 🛠️ Setup

### Prerequisites

- **Node.js** 20+ (via nvm or similar)
- **pnpm** 9+ (`corepack enable`)
- **Rust** stable (via rustup)
- **Platform tools:**
  - macOS: Xcode Command Line Tools
  - Windows: Visual Studio Build Tools
  - Linux: `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, etc.

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/ps2-manager
cd ps2-manager

# Install dependencies
pnpm install

# Start development
pnpm run tauri:dev
```

---

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **React 19** with TypeScript strict mode
- **Vite** for fast dev server and builds
- **Tauri** for desktop integration
- **Functional paradigm** throughout

### Backend (Rust)

- **Tauri 2.9** for desktop framework
- **Modular design** - each feature in its own file
- **Type-safe** - leveraging Rust's type system
- **Performance-focused** - zero-copy where possible

### Communication

- **Tauri Commands** - Rust functions called from frontend
- **Events** - For real-time updates (download progress, etc.)
- **Store** - For persistent settings

---

## 📦 Project Structure

```
ps2-manager/
├── src/                          # Frontend
│   ├── components/              # React components
│   │   ├── AppHeader.tsx        # Main header
│   │   ├── NavBar.tsx           # Navigation
│   │   └── ...
│   ├── hooks/                   # Custom hooks
│   │   ├── useCatalog.ts       # Game catalog state
│   │   ├── useCoverOps.ts      # Cover operations
│   │   └── ...
│   ├── pages/                   # Page components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── LibraryView.tsx     # Library management
│   │   └── ...
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── actions/                 # Backend calls
│   ├── contexts/                # React contexts
│   ├── types/                   # TypeScript types
│   └── utils/                   # Utility functions
│
├── src-tauri/                   # Backend
│   └── src/
│       ├── lib.rs               # Entry point, command registration
│       ├── scanner.rs           # ISO scanning and validation
│       ├── security.rs          # Security features
│       ├── remote.rs            # Download functionality
│       ├── duplicates.rs        # Duplicate detection
│       ├── backup.rs            # Backup system
│       ├── cheats.rs            # Cheat management
│       ├── covers.rs            # Cover art operations
│       ├── vmc.rs               # VMC management
│       └── ...
│
├── public/                      # Static assets
│   ├── ps2-logo.svg
│   ├── controller-icon.svg
│   └── ...
│
├── docs/                        # Documentation
├── scripts/                     # Build/release scripts
└── .github/                     # GitHub Actions & templates
```

---

## 🔨 Common Tasks

### Run Development Server

```bash
pnpm run tauri:dev
```

- Hot reload for frontend changes
- Manual restart for backend changes

### Build for Production

```bash
pnpm run tauri:build
```

Creates installers in `src-tauri/target/release/bundle/`.

### Lint Code

```bash
# Frontend
pnpm run lint

# Backend
cd src-tauri && cargo clippy
```

### Format Code

```bash
# Frontend (handled by ESLint)
pnpm run lint --fix

# Backend
cd src-tauri && cargo fmt
```

### Type Check

```bash
# Frontend
tsc -b

# Backend
cd src-tauri && cargo check
```

---

## 🎨 Styling

### CSS Variables

```css
--neo-bg: #0a0b10           /* Background */
--neo-surface: #0f1116      /* Surface */
--neo-border: #202636       /* Borders */
--neo-text: #e6f0ff         /* Text */
--neo-accent: #4cc2ff       /* Primary (blue) */
--neo-accent-2: #ff3df0     /* Accent (magenta) */
--neo-accent-3: #39ff14     /* Success (green) */
```

### Component Patterns

```tsx
// Use functional components
export const MyComponent = ({ prop1, prop2 }: Props) => {
  // Use hooks
  const [state, setState] = useState(initial)
  
  // Memoize expensive calculations
  const result = useMemo(() => compute(prop1), [prop1])
  
  // Memoize callbacks
  const handler = useCallback(() => {
    // Handle event
  }, [dependencies])
  
  return <div>...</div>
}

// Export with memo if needed
export const MyComponent = memo(MyComponentInner)
```

---

## 🦀 Rust Patterns

### Tauri Commands

```rust
#[tauri::command]
pub fn my_command(parameter: String) -> Result<ReturnType, String> {
  // Validate input
  if parameter.is_empty() {
    return Err("Parameter required".into());
  }
  
  // Do work
  let result = do_something(&parameter)?;
  
  // Return result
  Ok(result)
}
```

### Error Handling

```rust
// Use Result for fallible operations
pub fn risky_operation() -> Result<Data, String> {
  let file = fs::read_to_string(path)
    .map_err(|error| error.to_string())?;
  
  Ok(parse(file))
}

// Use ? operator for propagation
let data = risky_operation()?;
```

---

## 🧪 Testing Strategy

### Frontend Testing (Coming Soon)

- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

### Backend Testing

```bash
cd src-tauri
cargo test
```

---

## 🐛 Debugging

### Frontend

Use Chrome DevTools (Cmd+Option+I on macOS).

### Backend

Add `println!` or use `dbg!`:

```rust
dbg!(&variable);
println!("Debug: {:?}", value);
```

### Tauri Console

Backend logs appear in terminal where you ran `tauri:dev`.

---

## 🚀 Performance

### Frontend Optimization

- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for stable function references
- Lazy load heavy components
- Minimize re-renders

### Backend Optimization

- Use constants instead of dynamic allocations
- Chain operations instead of intermediate variables
- Use early returns to avoid unnecessary work
- Profile with `cargo flamegraph` if needed

---

## 📚 Resources

### Tauri
- [Tauri Docs](https://tauri.app/)
- [Tauri API](https://tauri.app/v1/api/js/)

### React
- [React Docs](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Rust
- [Rust Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

---

## 🤝 Getting Help

- Check existing [documentation](README.md)
- Search [issues](https://github.com/YOUR_USERNAME/ps2-manager/issues)
- Ask in [discussions](https://github.com/YOUR_USERNAME/ps2-manager/discussions)
- Read the [source code](https://github.com/YOUR_USERNAME/ps2-manager)

---

**Happy coding!** 💻
