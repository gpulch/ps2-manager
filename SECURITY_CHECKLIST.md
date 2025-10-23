# Security Checklist for GitHub

**Before pushing to GitHub, verify all items are ✅**

---

## 🔒 Sensitive Data Protection

### Environment Variables
- ✅ `.env` files in `.gitignore`
- ✅ `.env.example` provided (no secrets)
- ✅ All API keys use environment variables
- ✅ No hardcoded credentials in code

### Secret Files
- ✅ `*secret*` patterns in `.gitignore`
- ✅ `*.key`, `*.pem` files excluded
- ✅ No credentials in configuration files
- ✅ User settings excluded (`settings.json`)

### Build Artifacts
- ✅ `target/` excluded (Rust builds)
- ✅ `dist/` excluded (Frontend builds)
- ✅ `node_modules/` excluded
- ✅ Build logs excluded

---

## 🔍 Code Review

### Check for Hardcoded Secrets
```bash
# Search for potential secrets
grep -r "API_KEY\|SECRET\|PASSWORD\|TOKEN" src/ --exclude-dir=node_modules
grep -r "api[_-]key\|secret\|password" src-tauri/src/

# Should only find comments or env var references
```

### Verify .gitignore
```bash
# Test what would be committed
git status --short
git ls-files --others --ignored --exclude-standard

# Verify sensitive files are ignored
ls -la .env* 2>/dev/null && echo "❌ .env files found!"
```

---

## 📦 Dependencies

### NPM Audit
```bash
pnpm audit
pnpm audit --fix

# Check for critical vulnerabilities
pnpm audit --audit-level=critical
```

### Cargo Audit
```bash
cd src-tauri
cargo audit
cargo audit --deny warnings
```

### Update Dependencies
```bash
# Check for updates
pnpm outdated
cargo outdated

# Update carefully
pnpm update
cargo update
```

---

## 🔐 GitHub Repository Settings

### Branch Protection
- ✅ Enable branch protection on `main`
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Enforce linear history

### Secrets Management
- ✅ Use GitHub Secrets for CI/CD
- ✅ Never log secrets in workflows
- ✅ Rotate secrets regularly

### Security Features
- ✅ Enable Dependabot alerts
- ✅ Enable Dependabot security updates
- ✅ Enable secret scanning
- ✅ Enable code scanning (CodeQL)

---

## 🚨 Pre-Push Checklist

### Verify No Secrets
```bash
# Check staged files for secrets
git diff --cached | grep -i "secret\|password\|api[_-]key\|token"

# If found, remove them!
```

### Clean Commit History
```bash
# Review commits
git log --oneline -10

# Amend if needed
git commit --amend

# Squash if necessary
git rebase -i HEAD~N
```

### Test Build
```bash
# Clean build
pnpm run clean
pnpm run build

# Verify no errors
echo $?  # Should be 0
```

---

## 📝 Documentation

### README Safety
- ✅ No real API keys in examples
- ✅ Use placeholder values
- ✅ Link to .env.example
- ✅ Security section included

### Contributing Guide
- ✅ Security guidelines included
- ✅ How to report vulnerabilities
- ✅ Responsible disclosure policy

---

## 🎯 GitHub Actions Security

### Workflow Files
```yaml
# ✅ Use secrets
env:
  API_KEY: ${{ secrets.API_KEY }}

# ❌ Never hardcode
env:
  API_KEY: "abc123"  # DON'T DO THIS!
```

### Permissions
```yaml
# Minimal permissions
permissions:
  contents: read
  pull-requests: write
```

---

## 🔒 Current Status

### Protected Files (in .gitignore)
```
✅ .env
✅ .env.*
✅ src-tauri/.env
✅ *secret*
✅ *credential*
✅ *.key
✅ *.pem
✅ settings.json
✅ target/
✅ dist/
✅ node_modules/
```

### Safe to Commit
```
✅ .env.example
✅ .gitignore
✅ Source code (no secrets)
✅ Documentation
✅ Configuration (no secrets)
✅ Workflows (use GitHub Secrets)
```

---

## 🚀 Safe Push Commands

### First Push
```bash
# Verify clean state
git status

# Review all changes
git diff

# Add files carefully
git add .

# Commit with meaningful message
git commit -m "Initial commit: PS2 Manager v0.2.0-alpha"

# Push to GitHub
git push -u origin main
```

### Subsequent Pushes
```bash
# Always review first
git status
git diff

# Selective adding recommended
git add <specific-files>

# Push
git push
```

---

## 🛡️ If Secrets Are Accidentally Committed

### Immediate Actions
1. **Rotate the compromised secret immediately**
2. **Remove from git history:**
   ```bash
   # Use BFG Repo-Cleaner
   bfg --delete-files secret.key
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```
3. **Update .gitignore**
4. **Notify team**
5. **Monitor for unauthorized use**

---

## ✅ Final Verification

Before pushing:
```bash
# 1. Check .gitignore is complete
cat .gitignore

# 2. Verify no secrets in tracked files
git ls-files | xargs grep -i "secret\|password\|api.key"

# 3. Check what will be pushed
git diff origin/main..HEAD

# 4. Run security scan
pnpm audit
cargo audit

# 5. Build succeeds
pnpm run build
```

---

## 📞 Security Contacts

**Report Vulnerabilities:**
- Create private security advisory on GitHub
- Or email: [your-email]@[domain].com

**Security Policy:**
See [SECURITY.md](SECURITY.md) for full policy.

---

**✅ All checks passed? Safe to push!** 🚀

**Remember:** When in doubt, DON'T push. Review again.
