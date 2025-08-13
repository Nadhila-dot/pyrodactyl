#!/bin/bash

# root yuh
if [ "$EUID" -ne 0 ]; then
  echo "Can't update the panel without root privileges!!!"
  exit 1
fi


cd "$(dirname "$0")"


echo "Syncing with repo"
git pull origin main || { echo "Failed to pull changes."; exit 1; }

# Build the project using bun
echo "Building!!!"
bunx vite build || { echo "Build failed."; exit 1; }

echo "All good, restart webserver"