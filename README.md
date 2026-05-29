# ClosetIQ

A starter AI closet organizer app.

## How to run

1. Install Node.js LTS from https://nodejs.org
2. Open this folder in VS Code.
3. Rename `.env.example` to `.env`.
4. Put your real API keys inside `.env`.
5. Open the VS Code terminal in this folder.
6. Run:

```bash
npm install
npm run start
```

7. Open the local URL shown in the terminal, usually:

```txt
http://localhost:5173
```

## What it does

- Upload clothing pictures
- AI analyzes category, color, style, occasion, and tags
- Optional background removal through remove.bg
- Save clothing to your closet
- Organize by category
- Generate casual or activity outfits
- Saves closet items in browser localStorage

## API keys needed

- OpenAI API key for AI clothing analysis
- remove.bg API key for background removal
