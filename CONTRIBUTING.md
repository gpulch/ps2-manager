# Contributing to PS2 Manager

Thank you for your interest in contributing! This guide will help you get started.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ps2-manager
cd ps2-manager

# Install dependencies
pnpm install

# Start development server
pnpm run tauri:dev
```

---

## 📋 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/my-awesome-feature
```

### 2. Make Changes

Follow our coding standards (see below).

### 3. Test Your Changes

```bash
# Lint
pnpm run lint

# Type check
cd src-tauri && cargo check

# Build
pnpm run build
```

### 4. Commit

```bash
git add .
git commit -m "feat: add awesome feature"
```

### 5. Push & Create PR

```bash
git push origin feature/my-awesome-feature
```

Then create a Pull Request on GitHub.

---

## 📝 Coding Standards

### TypeScript/React

- Use **types** over interfaces
- Use **functional components** with hooks
- Use **immutable patterns** (no mutations)
- Use **pure functions** when possible
- Break code into **small, single-purpose functions**
- Use **React.memo**, **useMemo**, **useCallback** for optimization

### Naming Conventions

- **Files**: `camelCase.ts` (components: `PascalCase.tsx`)
- **Directories**: `kebab-case/`
- **Variables**: Full names, no abbreviations
  - ✅ `sourceDirectory`, `destinationPath`
  - ❌ `src`, `dest`, `dir`

### Code Style

- **English only** in code, comments, and documentation
- **Readable over clever** - prioritize clarity
- **Comment complex logic** but let code speak for itself
- **No magic numbers** - use named constants

---

## 🏗️ Project Structure

```
ps2-manager/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Page components
│   ├── ui/                 # UI components (Button, Input, etc.)
│   └── utils/              # Utility functions
├── src-tauri/              # Backend (Rust)
│   └── src/                # Rust source files
│       ├── lib.rs          # Entry point
│       ├── scanner.rs      # ISO scanning
│       ├── security.rs     # Security features
│       └── ...             # Other modules
├── docs/                   # Documentation
└── public/                 # Static assets
```

---

## 🧪 Testing

### Manual Testing

1. Test on your platform (macOS/Windows/Linux)
2. Test all major features
3. Try to break things!

### Automated Testing (Coming Soon)

We're working on adding comprehensive tests.

---

## 📖 Documentation

When adding features:

1. **Update README.md** if user-facing
2. **Update docs/USER_GUIDE.md** for user instructions
3. **Add comments** for complex code
4. **Update CHANGELOG.md** with your changes

---

## 🐛 Reporting Bugs

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md):

1. Clear description
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots if applicable
5. Your environment (OS, version)

---

## 💡 Suggesting Features

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md):

1. Problem it solves
2. Proposed solution
3. Alternatives considered
4. Additional context

---

## 🔄 Pull Request Process

1. **Fill out PR template** completely
2. **Link related issues** using keywords
3. **Ensure CI passes** (GitHub Actions)
4. **Request review** from maintainers
5. **Address feedback** promptly
6. **Wait for approval** before merging

---

## ✅ PR Checklist

Before submitting:

- [ ] Code follows project style
- [ ] No new warnings or errors
- [ ] Updated documentation
- [ ] English only (no French)
- [ ] No abbreviations in variable names
- [ ] Tests pass (when available)
- [ ] Ready for review

---

## 🎯 Good First Issues

Look for issues labeled `good first issue` on GitHub.

---

## 📞 Need Help?

- Open a [discussion](https://github.com/YOUR_USERNAME/ps2-manager/discussions)
- Ask in the PR or issue
- Check existing documentation

---

## 📜 Code of Conduct

Be respectful, inclusive, and professional.

---

**Thank you for contributing!** 🙏
