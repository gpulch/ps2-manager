# Security Guide

Understanding PS2 Manager's security features and how they protect you.

---

## 🔒 Security Overview

PS2 Manager implements 8 layers of security protection to ensure safe downloads and file operations.

---

## 🛡️ Protection Layers

### 1. HTTPS Enforcement
**What it does:** Only allows encrypted connections  
**Why it matters:** Prevents eavesdropping and man-in-the-middle attacks  
**User impact:** None - works automatically

### 2. Domain Whitelist
**What it does:** Only allows downloads from archive.org and official CDNs  
**Why it matters:** Prevents malware and phishing  
**User impact:** Cannot download from untrusted sources

### 3. Filename Sanitization
**What it does:** Removes dangerous characters from filenames  
**Why it matters:** Prevents path traversal attacks  
**Protected characters:** `../`, `..\\`, null bytes, control characters

### 4. Path Validation
**What it does:** Ensures files stay in your library folder  
**Why it matters:** Prevents unauthorized file access  
**User impact:** Cannot save files outside library

### 5. File Size Limits
**What it does:** Enforces 1 MB minimum, 10 GB maximum  
**Why it matters:** Prevents DOS attacks and corrupted files  
**User impact:** Very small or huge files are rejected

### 6. Content-Type Validation
**What it does:** Verifies file is actually an ISO image  
**Why it matters:** Prevents downloading wrong file types  
**User impact:** Warning mode (doesn't block, just warns)

### 7. Error Sanitization
**What it does:** Hides system paths from error messages  
**Why it matters:** Prevents information disclosure  
**Example:** `/Users/you/...` becomes `[USER]/...`

### 8. Download Integrity
**What it does:** 4-level validation of downloads  
**Why it matters:** Ensures complete, uncorrupted files  
**Levels:**
1. Content-Length required before download
2. Interrupt detection during download
3. Bytes downloaded == expected
4. File size on disk == expected

---

## ✅ What's Safe

### Safe Downloads
- ✅ Archive.org collections
- ✅ Official game archives
- ✅ Redump verified images

### Safe Operations
- ✅ Scanning folders
- ✅ Renaming files
- ✅ Moving CD/DVD
- ✅ Importing covers
- ✅ Managing cheats
- ✅ Exporting catalogs

---

## ⚠️ What to Avoid

### Risky Actions
- ❌ Don't download from unknown websites
- ❌ Don't modify system files
- ❌ Don't run as root/admin unless necessary
- ❌ Don't disable antivirus during downloads

### Warning Signs
- 🚨 Download from unfamiliar domain → Blocked
- 🚨 File size is 0 bytes → Rejected
- 🚨 Path contains `../` → Sanitized
- 🚨 Download interrupted → Auto-deleted

---

## 🔍 How to Verify Safety

### Check Download Source
```
✅ Good: https://archive.org/download/...
❌ Bad:  http://random-site.com/...
```

### Check File Size
```
✅ Good: 1.5 GB (reasonable for PS2 game)
❌ Bad:  500 KB (too small, likely corrupted)
❌ Bad:  15 GB (too large, exceeds limit)
```

### Check Download Progress
```
✅ Good: Progress bar moves smoothly
✅ Good: Final size matches expected
❌ Bad:  Download stops at 20%
❌ Bad:  File is smaller than expected
```

---

## 🛠️ Security Settings

### View Security Status
Click the security badge in bottom-right corner to see:
- Active protections (all 8 layers)
- Allowed domains (archive.org)
- File size limits (1 MB - 10 GB)
- Download validation status

### No Configuration Needed
All security features are always active and cannot be disabled.

---

## 🚨 If Something Goes Wrong

### Download Fails
1. **Check error message** - It will tell you what went wrong
2. **Try again** - Might be temporary network issue
3. **Verify source** - Make sure it's from archive.org
4. **Check file size** - Ensure it's reasonable
5. **Report issue** - If problem persists

### Suspicious File Detected
1. **Don't run it** - Keep it isolated
2. **Delete immediately** - Don't take chances
3. **Scan with antivirus** - Double-check
4. **Report to us** - Help protect others

### App Behaves Strangely
1. **Restart the app** - Fixes most issues
2. **Check for updates** - Might be a known bug
3. **Scan system** - Run antivirus scan
4. **Report bug** - Help us improve

---

## 📚 Technical Details

For developers and technical users, see [SECURITY_TECHNICAL.md](SECURITY_TECHNICAL.md) for:
- Implementation details
- Security architecture
- Validation algorithms
- Threat model
- Compliance information

---

## ✅ Security Checklist

Before downloading:
- [ ] Verify source is archive.org
- [ ] Check file size is reasonable
- [ ] Ensure stable internet connection
- [ ] Have enough disk space

During download:
- [ ] Monitor progress bar
- [ ] Watch for error messages
- [ ] Don't interrupt if possible

After download:
- [ ] Verify file size matches expected
- [ ] Check game appears in library
- [ ] Test with OPL to confirm it works

---

## 🎓 Best Practices

### For Safety
1. **Always use latest version** - Get security updates
2. **Don't modify app files** - Could break protections
3. **Report issues** - Help improve security
4. **Keep backups** - In case something goes wrong

### For Privacy
1. **No tracking** - App doesn't collect personal data
2. **Local storage** - Everything stays on your computer
3. **No accounts** - No registration required
4. **Open source** - Code is public for review

---

## 🔐 Compliance

PS2 Manager follows industry security standards:
- ✅ OWASP Top 10 protection
- ✅ CWE compliance
- ✅ Zero known vulnerabilities
- ✅ Regular security audits

---

## 📞 Report Security Issue

Found a security vulnerability?
1. **Don't post publicly** - Keep it confidential
2. **Email maintainers** - Use GitHub security advisory
3. **Provide details** - Steps to reproduce
4. **Wait for fix** - We'll respond ASAP

---

**Your safety is our priority.** 🔒
