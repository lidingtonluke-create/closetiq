@echo off
cd /d %~dp0
if not exist .env (
  copy .env.example .env
  echo.
  echo IMPORTANT: A .env file was created.
  echo Open .env and paste your OPENAI_API_KEY and REMOVE_BG_API_KEY.
  echo Then save it and run this file again.
  pause
  exit /b
)
if not exist node_modules (
  echo Installing app packages. This may take a few minutes the first time.
  npm install
)
echo Starting ClosetIQ...
npm run start
pause
