# update-repo.ps1 - Simple script to add files and make repo private

# Safety checks
if (-not (Test-Path .\.git)) {
    Write-Error "Not a git repository. Run from repo root."
    exit 1
}
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) not installed. Get it from https://cli.github.com/"
    exit 1
}
if (-not (gh auth status 2>$null)) {
    Write-Error "Not logged in to GitHub CLI. Run 'gh auth login' first."
    exit 1
}

# Create LICENSE
$license = @"
MIT License

Copyright (c) 2026 laserpanama

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
"@

# Create README.md
$readme = @"
# Lucky Clover Ranch

AI Studio app - a full-stack React/Vite + Express/TSX project.

## Quick Start
1. Clone: git clone git@github.com:laserpanama/lucky-clover-ranch.git
2. Install: npm install
3. Set API key in .env.local
4. Run: npm run dev

## License
MIT
"@

# Create CI workflow
$ci = @"
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
"@

# Write files
Write-Host "Creating files..." -ForegroundColor Yellow
Set-Content -Path LICENSE -Value $license -Encoding UTF8
Set-Content -Path README.md -Value $readme -Encoding UTF8
New-Item -ItemType Directory -Path .github/workflows -Force
Set-Content -Path .github/workflows/ci.yml -Value $ci -Encoding UTF8

# Git operations
Write-Host "Committing files..." -ForegroundColor Yellow
git add LICENSE README.md .github/workflows/ci.yml
git commit -m "Add license, README, and CI workflow" 2>$null

if ($LASTEXITCODE -eq 0) {
    git push origin HEAD
    Write-Host "SUCCESS: Files pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "NOTE: No changes to commit (files already exist)" -ForegroundColor Yellow
}

# Make repo private
Write-Host "Setting repository to private..." -ForegroundColor Yellow
gh repo edit laserpanama/lucky-clover-ranch --visibility private --accept-visibility-change-consequences

# Verify
$vis = gh repo view laserpanama/lucky-clover-ranch --json visibility -q .visibility
if ($vis -eq "private") {
    Write-Host "SUCCESS: Repository is now PRIVATE" -ForegroundColor Green
} else {
    Write-Host "WARNING: Visibility is $vis" -ForegroundColor Red
}
