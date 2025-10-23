# PS2 Manager v{VERSION} - {RELEASE_NAME}

> **Release Type:** {Alpha/Beta/Stable}  
> **Release Date:** {DATE}  
> **Platform Support:** macOS (Intel + Apple Silicon), Windows, Linux

---

## 🎯 What's New

### Major Features
- 

### Improvements
- 

### Bug Fixes
- 

---

## 🔒 Security

This release includes enterprise-level security:
- ✅ 8-layer protection system
- ✅ HTTPS enforcement
- ✅ Download integrity validation
- ✅ OWASP compliant

See [SECURITY.md](./SECURITY.md) for complete details.

---

## 📦 Installation

### macOS
1. Download `PS2-Manager_{VERSION}_aarch64.dmg` (Apple Silicon) or `PS2-Manager_{VERSION}_x64.dmg` (Intel)
2. Open the DMG and drag PS2 Manager to Applications
3. First launch: Right-click → Open (to bypass Gatekeeper)

### Windows
1. Download `PS2-Manager_{VERSION}_x64-setup.exe`
2. Run the installer
3. Windows may show SmartScreen warning - click "More info" → "Run anyway"

### Linux
1. Download `ps2-manager_{VERSION}_amd64.AppImage` or `.deb`
2. For AppImage: `chmod +x ps2-manager_*.AppImage && ./ps2-manager_*.AppImage`
3. For DEB: `sudo dpkg -i ps2-manager_*.deb`

---

## ⚙️ System Requirements

**Minimum:**
- macOS 10.15+ / Windows 10+ / Ubuntu 20.04+
- 4 GB RAM
- 500 MB disk space
- Internet connection (for downloading ISOs and covers)

**Recommended:**
- macOS 12+ / Windows 11 / Ubuntu 22.04+
- 8 GB RAM
- 50 GB+ disk space (for game library)
- Fast internet connection

---

## 🚀 Quick Start

1. Launch PS2 Manager
2. Select Library folder (or plug in OPL disk)
3. Scan for games
4. Download ISOs from Archive.org or import existing ones
5. Auto-fetch cover art
6. Manage cheats, VMCs, and more

See [README.md](./README.md) for complete documentation.

---

## 📚 Documentation

- **User Guides:**
  - [Security Guide](./README_SECURITY.md) - Understanding security features
  - [PS2 Cheats Guide](./PS2_CHEATS_GUIDE.md) - Complete cheats documentation
  - [Remote Sources Guide](./REMOTE_SOURCES_GUIDE.md) - Downloading ISOs

- **Technical:**
  - [Security Documentation](./SECURITY.md) - Security system details
  - [Download Validation](./DOWNLOAD_VALIDATION.md) - Integrity system
  - [Release Notes](./RELEASE_NOTES.md) - Full changelog

---

## ⚠️ Known Issues

{LIST_KNOWN_ISSUES}

---

## 🐛 Reporting Issues

Found a bug? Please report it:
1. Check [existing issues](../../issues) first
2. Create new issue with:
   - Platform (macOS/Windows/Linux)
   - Version number
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

---

## 💬 Support

- **Documentation:** See docs in repository
- **Issues:** [GitHub Issues](../../issues)
- **Discussions:** [GitHub Discussions](../../discussions)

---

## 🙏 Credits

Built with:
- [Tauri](https://tauri.app/) - Desktop framework
- [React](https://react.dev/) - UI framework
- [Rust](https://www.rust-lang.org/) - Backend language
- [Vite](https://vitejs.dev/) - Build tool

Special thanks to:
- Archive.org for hosting game collections
- GameTDB for cover art database
- PS2 homebrew community

---

## 📝 Checksums

**SHA256:**
```
{MACOS_ARM64_SHA256}  PS2-Manager_{VERSION}_aarch64.dmg
{MACOS_X64_SHA256}    PS2-Manager_{VERSION}_x64.dmg
{WINDOWS_SHA256}      PS2-Manager_{VERSION}_x64-setup.exe
{LINUX_DEB_SHA256}    ps2-manager_{VERSION}_amd64.deb
{LINUX_APPIMAGE_SHA256} ps2-manager_{VERSION}_amd64.AppImage
```

---

## 📄 License

See [LICENSE](./LICENSE) file for details.

---

**Enjoy managing your PS2 collection! 🎮**
