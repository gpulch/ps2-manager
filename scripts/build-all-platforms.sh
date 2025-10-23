#!/bin/bash
set -e

# PS2 Manager - Local Multi-Platform Build Script
# This script builds for multiple targets locally (requires cross-compilation setup)

echo "🏗️  PS2 Manager - Multi-Platform Build"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v cargo &> /dev/null; then
  echo "❌ cargo not found. Please install Rust."
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm not found. Please install pnpm."
  exit 1
fi

echo "✅ Prerequisites satisfied"
echo ""

# Build frontend
echo "📦 Building frontend..."
pnpm install
pnpm run build

echo "✅ Frontend built"
echo ""

# Build backend for current platform
echo "🦀 Building backend..."
cd src-tauri

PLATFORM=$(uname -s)
ARCH=$(uname -m)

echo "Platform: $PLATFORM"
echo "Architecture: $ARCH"
echo ""

if [ "$PLATFORM" = "Darwin" ]; then
  echo "🍎 Building for macOS..."
  
  # Build for Apple Silicon
  if [ "$ARCH" = "arm64" ]; then
    echo "  → Building native arm64..."
    cargo build --release
    
    # Also build for x86_64 if Rosetta is available
    if rustup target list | grep -q "x86_64-apple-darwin (installed)"; then
      echo "  → Cross-building for x86_64..."
      cargo build --release --target x86_64-apple-darwin
    fi
  else
    echo "  → Building native x86_64..."
    cargo build --release
    
    # Also build for arm64 if cross-compilation is available
    if rustup target list | grep -q "aarch64-apple-darwin (installed)"; then
      echo "  → Cross-building for arm64..."
      cargo build --release --target aarch64-apple-darwin
    fi
  fi
  
elif [ "$PLATFORM" = "Linux" ]; then
  echo "🐧 Building for Linux..."
  cargo build --release
  
elif [ "$PLATFORM" = "MINGW"* ] || [ "$PLATFORM" = "MSYS"* ]; then
  echo "🪟 Building for Windows..."
  cargo build --release
  
else
  echo "❌ Unsupported platform: $PLATFORM"
  exit 1
fi

cd ..

echo ""
echo "✅ Build complete!"
echo ""
echo "📂 Binaries location:"
if [ "$PLATFORM" = "Darwin" ]; then
  echo "   macOS (current): src-tauri/target/release/ps2-manager"
  if [ -d "src-tauri/target/x86_64-apple-darwin/release" ]; then
    echo "   macOS (x86_64): src-tauri/target/x86_64-apple-darwin/release/ps2-manager"
  fi
  if [ -d "src-tauri/target/aarch64-apple-darwin/release" ]; then
    echo "   macOS (arm64): src-tauri/target/aarch64-apple-darwin/release/ps2-manager"
  fi
elif [ "$PLATFORM" = "Linux" ]; then
  echo "   Linux: src-tauri/target/release/ps2-manager"
else
  echo "   Windows: src-tauri/target/release/ps2-manager.exe"
fi

echo ""
echo "💡 To create distributable bundles, use:"
echo "   pnpm run tauri build"
