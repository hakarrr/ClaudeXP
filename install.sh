#!/usr/bin/env bash
# ClaudeXP installer (macOS / Linux)
# One-liner:
#   curl -fsSL https://raw.githubusercontent.com/EvanPaules/ClaudeXP/main/install.sh | bash

set -e

REPO="${CLAUDEXP_REPO:-EvanPaules/ClaudeXP}"

echo
echo "⚡  Installing ClaudeXP from github:$REPO"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 18+ is required. Install from https://nodejs.org and re-run."
  exit 1
fi

NODE_VER=$(node --version | sed 's/v//')
NODE_MAJOR=${NODE_VER%%.*}
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Node $NODE_VER found — ClaudeXP needs 18+. Upgrade: https://nodejs.org"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found (should come bundled with Node.js)."
  exit 1
fi

npm install -g "github:$REPO"

echo
echo "✓  ClaudeXP installed. Running setup..."
echo

claudexp setup
