#!/usr/bin/env bash
# Double-click launcher for macOS (also runs on Linux: ./Start\ Datamosher.command)
# First run installs Electron (~1 min), after that it starts instantly.
set -e
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  echo "First run: installing Electron..."
  npm install --no-audit --no-fund
fi
npm start
