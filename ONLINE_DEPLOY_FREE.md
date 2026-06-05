# CanCan Online - Free Deploy Guide

This project is now ready for internet play with a free WebSocket server deploy.

## Option A: Render (Free)

1. Push this repository to GitHub.
2. Go to Render Dashboard and create a new Blueprint.
3. Select your repository (Render will read `render.yaml`).
4. Deploy.
5. After deploy, copy your public URL, e.g. `https://cancan-online-ws.onrender.com`.
6. In game online menu, set WS URL to:
   - `wss://cancan-online-ws.onrender.com`

## Option B: Local test only

1. Open terminal in `online-server`.
2. Run:
   - `npm install`
   - `npm start`
3. Use WS URL:
   - `ws://localhost:8787`

## Playing from different homes

- Both players open the same game page.
- Both players enter the same WS URL and room code.
- One selects Host, the other selects Join.

## Notes

- If your game page uses HTTPS, WS URL must be `wss://...`.
- Render free services may sleep when idle.
- Current architecture is host-authoritative with server-side message validation.
