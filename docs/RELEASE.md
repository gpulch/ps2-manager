# 🚀 How to Release PS2 Manager

**Complete step-by-step guide for creating an alpha/beta/stable release**

---

## 📋 Quick Release Commands

```bash
# One-line release (recommended)
./scripts/prepare-release.sh 0.2.0 alpha && git push origin main && git push origin v0.2.0-alpha.1

# Or step by step:
./scripts/prepare-release.sh 0.2.0 alpha
git push origin main
git push origin v0.2.0-alpha.1
```

That's it! GitHub Actions will build everything automatically.

---

## 🎯 Detailed Step-by-Step Process

### Step 1: Pre-Release Checks ✅

```bash
# Ensure everything is committed
git status

# Run all tests
cd src-tauri && cargo check && cd ..
pnpm lint
pnpm run build

# Should see: ✅ 0 errors
```

### Step 2: Run Release Script 🏗️

```bash
# For alpha release
./scripts/prepare-release.sh 0.2.0 alpha

# For beta release
./scripts/prepare-release.sh 0.2.0 beta

# For stable release
./scripts/prepare-release.sh 0.2.0 stable
```

**What this script does:**
- ✅ Validates version format
- ✅ Checks git status (must be clean)
- ✅ Updates package.json
- ✅ Updates Cargo.toml
- ✅ Updates tauri.conf.json
- ✅ Runs all tests
- ✅ Creates git commit
- ✅ Creates git tag

### Step 3: Push to GitHub 📤

```bash
# Push code
git push origin main

# Push tag (this triggers the build)
git push origin v0.2.0-alpha.1
```

### Step 4: Monitor GitHub Actions 👀

1. Go to: `https://github.com/YOUR_USERNAME/ps2-manager/actions`
2. Watch the "Release Build" workflow
3. Wait ~15-20 minutes for all platforms to build

**Builds created:**
- 🍎 macOS (Apple Silicon) - `.dmg`
- 🍎 macOS (Intel) - `.dmg`
- 🪟 Windows - `-setup.exe`
- 🐧 Linux (Debian) - `.deb`
- 🐧 Linux (AppImage) - `.AppImage`

### Step 5: Review Draft Release 📝

1. Go to: `https://github.com/YOUR_USERNAME/ps2-manager/releases`
2. Find the draft release (created automatically)
3. Edit the release notes:
   - Use `.github/RELEASE_TEMPLATE.md` as template
   - Copy relevant sections from `RELEASE_NOTES.md`
   - Highlight key features for this version
   - List known issues if any

### Step 6: Test Artifacts 🧪

1. Download artifacts for your platform
2. Install and test:
   - ✅ App launches
   - ✅ All features work
   - ✅ No crashes
   - ✅ Security features active

### Step 7: Publish Release 🎉

1. Click "Publish release"
2. Release is now public!
3. Users can download immediately

### Step 8: Announce 📢

Post in GitHub Discussions:
```markdown
## 🎉 PS2 Manager v0.2.0-alpha.1 Released!

We're excited to announce the first alpha release!

### What's New
- Security hardening (8-layer protection)
- Performance optimization (20-60% faster)
- Duplicate detector
- Backup & restore system

### Download
[Download for your platform →](https://github.com/YOUR_USERNAME/ps2-manager/releases/latest)

### Feedback
Please report any issues you find!
```

---

## 🔄 Version Numbering

### Format: `MAJOR.MINOR.PATCH`

**Alpha Release:**
- `v0.2.0-alpha.1` (first alpha)
- `v0.2.0-alpha.2` (second alpha)

**Beta Release:**
- `v0.2.0-beta.1` (first beta)
- `v0.2.0-beta.2` (second beta)

**Stable Release:**
- `v0.2.0` (production ready)

### When to Bump Versions

**MAJOR (1.0.0):**
- Breaking changes
- Major redesign
- Complete rewrites

**MINOR (0.X.0):**
- New features
- Non-breaking changes
- Most releases

**PATCH (0.0.X):**
- Bug fixes only
- Security patches
- Minor tweaks

---

## 🐛 Troubleshooting

### Build Failed on GitHub Actions

**Check logs:**
```bash
# Go to Actions tab → Failed workflow → Click on failed job
```

**Common issues:**
- Missing dependencies in Cargo.toml
- Invalid tauri.conf.json
- Type errors in TypeScript
- Linting errors

**Fix:**
```bash
# Run tests locally first
cargo check
pnpm lint
pnpm run build
```

### Can't Push Tag

**Error:** `tag already exists`

**Solution:**
```bash
# Delete local tag
git tag -d v0.2.0-alpha.1

# Delete remote tag (if exists)
git push origin :refs/tags/v0.2.0-alpha.1

# Recreate
git tag -a v0.2.0-alpha.1 -m "Release v0.2.0-alpha.1"
git push origin v0.2.0-alpha.1
```

### Wrong Version in Files

**Manually update:**
```bash
# package.json
npm version 0.2.0 --no-git-tag-version

# src-tauri/Cargo.toml
# Change: version = "0.2.0"

# src-tauri/tauri.conf.json
# Change: "version": "0.2.0"
```

---

## 🧪 Testing a Release Locally

### Build for Current Platform

```bash
pnpm run tauri:build
```

**Output:**
- macOS: `src-tauri/target/release/bundle/dmg/`
- Windows: `src-tauri/target/release/bundle/msi/`
- Linux: `src-tauri/target/release/bundle/deb/`

### Build for All Platforms (Requires Setup)

```bash
./scripts/build-all-platforms.sh
```

---

## 📝 Release Checklist

Copy this checklist for each release:

```markdown
## Pre-Release
- [ ] All features complete
- [ ] All bugs fixed
- [ ] Tests passing (cargo check, pnpm lint, build)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] RELEASE_NOTES.md written
- [ ] Version decided (0.2.0-alpha.1)

## Release
- [ ] Run: ./scripts/prepare-release.sh 0.2.0 alpha
- [ ] Push: git push origin main && git push origin v0.2.0-alpha.1
- [ ] Monitor GitHub Actions (~20 minutes)
- [ ] Review draft release
- [ ] Test artifacts on your platform
- [ ] Edit release notes
- [ ] Publish release

## Post-Release
- [ ] Announce in GitHub Discussions
- [ ] Update project board
- [ ] Monitor for critical issues
- [ ] Plan next release
```

---

## 🎯 Release Schedule (Suggested)

**Alpha Phase (2-4 weeks):**
- Weekly alpha releases (alpha.1, alpha.2, alpha.3...)
- Focus: Core features, major bugs
- Audience: Early testers

**Beta Phase (2-3 weeks):**
- Bi-weekly beta releases (beta.1, beta.2...)
- Focus: Polish, minor bugs, UX
- Audience: Wider testing

**Stable Release:**
- When: No critical bugs for 1 week
- Full production ready
- Audience: Everyone

---

## 📊 Release Template

Use this template for GitHub releases:

```markdown
# PS2 Manager v0.2.0-alpha.1

> **Release Type:** Alpha
> **Release Date:** October 23, 2025
> **Platforms:** macOS, Windows, Linux

## 🎯 What's New

- 🔒 Security hardening with 8-layer protection
- ⚡ Performance optimization (20-60% faster)
- 🔍 Duplicate detector
- 💾 Backup & restore system
- 🔎 Search & filter
- 📢 Toast notifications

## 📦 Download

Choose your platform:
- [macOS (Apple Silicon)](link-to-arm64.dmg)
- [macOS (Intel)](link-to-x64.dmg)
- [Windows](link-to-setup.exe)
- [Linux (.deb)](link-to-deb)
- [Linux (.AppImage)](link-to-appimage)

## ⚠️ Alpha Release Warning

This is an alpha release for testing. Please report any issues!

## 📚 Documentation

- [Release Notes](./RELEASE_NOTES.md)
- [Security Guide](./README_SECURITY.md)
- [User Guide](./README.md)

## 🐛 Known Issues

- None yet (please report if you find any!)

---

**Full changelog:** [RELEASE_NOTES.md](./RELEASE_NOTES.md)
```

---

## 🚨 Emergency Hotfix Process

If you need to release a critical fix:

```bash
# 1. Fix the bug
git commit -m "fix: critical bug description"

# 2. Quick release (patch version)
./scripts/prepare-release.sh 0.2.1 stable

# 3. Push immediately
git push origin main && git push origin v0.2.1

# 4. Edit release notes to highlight the fix
```

---

## 📞 Need Help?

- **Build issues:** Check GitHub Actions logs
- **Git issues:** See Troubleshooting section above
- **Version conflicts:** Manually update files
- **Everything broken:** Ask for help in discussions!

---

## ✅ That's It!

Releasing is now as simple as:
```bash
./scripts/prepare-release.sh 0.2.0 alpha && git push origin main && git push origin v0.2.0-alpha.1
```

Wait 20 minutes, edit the draft, publish. Done! 🎉
