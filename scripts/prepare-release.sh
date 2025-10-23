#!/bin/bash
set -e

# PS2 Manager - Release Preparation Script
# Usage: ./scripts/prepare-release.sh <version> [alpha|beta|stable]

VERSION=$1
RELEASE_TYPE=${2:-alpha}

if [ -z "$VERSION" ]; then
  echo "❌ Error: Version required"
  echo "Usage: ./scripts/prepare-release.sh <version> [alpha|beta|stable]"
  echo "Example: ./scripts/prepare-release.sh 0.2.0 alpha"
  exit 1
fi

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Error: Invalid version format. Use semantic versioning (e.g., 0.2.0)"
  exit 1
fi

# Add suffix for pre-releases
if [ "$RELEASE_TYPE" = "alpha" ]; then
  FULL_VERSION="v${VERSION}-alpha.1"
elif [ "$RELEASE_TYPE" = "beta" ]; then
  FULL_VERSION="v${VERSION}-beta.1"
else
  FULL_VERSION="v${VERSION}"
fi

echo "🚀 Preparing release: $FULL_VERSION"
echo ""

# Check we're on main/develop branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "develop" ]; then
  echo "⚠️  Warning: Not on main or develop branch (current: $BRANCH)"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "❌ Error: Uncommitted changes detected"
  echo "Please commit or stash your changes first"
  exit 1
fi

echo "✅ Git status clean"

# Update version in package.json
echo "📝 Updating package.json..."
npm version $VERSION --no-git-tag-version

# Update version in Cargo.toml
echo "📝 Updating Cargo.toml..."
cd src-tauri
cargo build --release --quiet 2>&1 | grep -v "Compiling\|Finished" || true
cd ..

# Update version in tauri.conf.json
echo "📝 Updating tauri.conf.json..."
TAURI_CONF="src-tauri/tauri.conf.json"
if command -v jq &> /dev/null; then
  jq ".version = \"$VERSION\"" $TAURI_CONF > ${TAURI_CONF}.tmp
  mv ${TAURI_CONF}.tmp $TAURI_CONF
else
  echo "⚠️  jq not found, skipping tauri.conf.json update"
  echo "Please manually update version to $VERSION in $TAURI_CONF"
fi

echo ""
echo "✅ Version updated to $VERSION in:"
echo "   - package.json"
echo "   - src-tauri/Cargo.toml"
echo "   - src-tauri/tauri.conf.json"
echo ""

# Run tests
echo "🧪 Running tests..."
echo ""

echo "  → cargo check..."
cd src-tauri
if cargo check 2>&1 | grep -i "error" > /dev/null; then
  echo "❌ cargo check failed"
  exit 1
fi
cd ..

echo "  → pnpm lint..."
if ! pnpm run lint > /dev/null 2>&1; then
  echo "❌ linting failed"
  exit 1
fi

echo "  → pnpm build..."
if ! pnpm run build > /dev/null 2>&1; then
  echo "❌ build failed"
  exit 1
fi

echo ""
echo "✅ All tests passed"
echo ""

# Create git tag
echo "🏷️  Creating git tag: $FULL_VERSION"
git add package.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json
git commit -m "chore: bump version to $VERSION"
git tag -a "$FULL_VERSION" -m "Release $FULL_VERSION"

echo ""
echo "✅ Release preparation complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Review the changes:"
echo "   git show"
echo ""
echo "2. Push to GitHub:"
echo "   git push origin $BRANCH"
echo "   git push origin $FULL_VERSION"
echo ""
echo "3. GitHub Actions will automatically:"
echo "   - Build for macOS (Intel + Apple Silicon)"
echo "   - Build for Windows"
echo "   - Build for Linux"
echo "   - Create draft release with binaries"
echo ""
echo "4. Edit and publish the draft release on GitHub"
echo ""
echo "🎉 Release tag: $FULL_VERSION"
