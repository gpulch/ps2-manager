# Alpha Release Checklist - PS2 Manager v0.2.0-alpha.1

## Pre-Release

- [ ] All code committed and pushed
- [ ] Version bumped in package.json, Cargo.toml, tauri.conf.json
- [ ] CHANGELOG.md updated
- [ ] RELEASE_NOTES.md finalized
- [ ] All tests passing (cargo check, pnpm lint, pnpm build)
- [ ] Documentation updated (README.md)

## Release Process

- [ ] Run: `./scripts/prepare-release.sh 0.2.0 alpha`
- [ ] Push tag: `git push origin v0.2.0-alpha.1`
- [ ] Monitor GitHub Actions build
- [ ] Download and test artifacts
- [ ] Edit draft release on GitHub
- [ ] Publish release

## Post-Release

- [ ] Announce in discussions
- [ ] Update project board
- [ ] Monitor for issues
- [ ] Plan beta release

## Build Artifacts Expected

- [ ] PS2-Manager_0.2.0_aarch64.dmg (macOS Apple Silicon)
- [ ] PS2-Manager_0.2.0_x64.dmg (macOS Intel)
- [ ] PS2-Manager_0.2.0_x64-setup.exe (Windows)
- [ ] ps2-manager_0.2.0_amd64.deb (Linux)
- [ ] ps2-manager_0.2.0_amd64.AppImage (Linux)
