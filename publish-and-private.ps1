<#=====================================================================
  publish-and-private.ps1
  -------------------------------------------------
  1️⃣  Writes/overwrites LICENSE, README.md, .github/workflows/ci.yml,
      Dockerfile
  2️⃣  git add → git commit → git push
  3️⃣  gh repo edit … --visibility private --accept-visibility-change-consequences
  4️⃣  Verifies the repo is now private
  =====================================================================#>

# ------------------- 0️⃣  Safety checks -------------------
if (-not (Test-Path .\.git)) {
    Write-Error "This does not look like a git repository. Run the script from the repo root."
    exit 1
}
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) is not installed or not in PATH. Install it from https://cli.github.com/"
    exit 1
}
if (-not (gh auth status 2>$null)) {
    Write-Error "You are not logged in to gh. Run `gh auth login` first."
    exit 1
}

# ------------------- 1️⃣  Helper to write a file from a literal block (single‑quoted here‑string) -----
function Write-FileFromBlock {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Content   # raw text – will be written exactly as‑is
    )
    # Ensure parent directory exists
    $parent = Split-Path $Path -Parent
    if ($parent -and -not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Set-Content -Path $Path -Value $Content -Encoding UTF8
    Write-Host "✅ Written $Path" -ForegroundColor Green
}

# ------------------- 2️⃣  File contents (single‑quoted here‑strings – no escaping needed) -----

# ---- LICENSE (MIT) ----
$license = @'
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
'@
Write-FileFromBlock -Path "LICENSE" -Content $license

# ---- README.md (expanded) ----
$readme = @'
# Lucky Clover Ranch 🍀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-%5E6.2-646cff)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-%5E6.4-2d3748)](https://www.prisma.io/)

> **AI Studio app** – a full‑stack React/Vite + Express/TSX project that talks to the Google Gemini API.

View the live prototype in AI Studio:  
https://ai.studio/apps/6efa1091-42f6-482d-aa6b-82f07db1bc5f

## 📋 Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Docker (optional)](#docker-optional)
- [CI/CD (GitHub Actions)](#cicd-github-actions)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Features
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide icons, Framer Motion.
- **Backend**: Express server written in TypeScript (`tsx`), with CORS, body‑parser, dotenv.
- **AI Integration**: Google Gemini SDK (`@google/genai`).
- **ORM**: Prisma 6 (PostgreSQL/SQLite/MySQL‑agnostic) – schema lives in `prisma/schema.prisma`.
- **Type‑safe** end‑to‑end (TS on both client & server).
- **Scripts** for dev, build, preview, lint, and clean.
- **Dockerfile** for easy containerised deployment.
- **GitHub Actions CI** that lint, type‑check, and build on every push/PR.

## 📂 Project Structure (as of latest commit)
