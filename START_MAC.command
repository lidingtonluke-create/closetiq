#!/bin/bash
cd "$(dirname "$0")"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "IMPORTANT: A .env file was created."
  echo "Open .env and paste your OPENAI_API_KEY and REMOVE_BG_API_KEY."
  echo "Then save it and run this file again."
  read -p "Press Enter to close..."
  exit 0
fi
if [ ! -d node_modules ]; then
  echo "Installing app packages. This may take a few minutes the first time."
  npm install
fi
echo "Starting ClosetIQ..."
npm run start
