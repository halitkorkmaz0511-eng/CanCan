# CanCan Online Server (Free-friendly)

Minimal WebSocket relay server for CanCan room-based online play.

## Run locally

1. Open terminal in this folder
2. Install deps:
   npm install
3. Start server:
   npm start
4. Server URL for the game menu:
   ws://localhost:8787

## Health check

- http://localhost:8787/health

## Notes

- This server is a room relay. Host client is authoritative and sends state snapshots.
- Suitable for free tiers / local usage.
- For production hardening, add authentication, rate limits, and server-side action validation.

## Built-in validation

- Room roles are enforced: one `host` + one `join` per room.
- Only `join` can send `action-request`.
- Only `host` can send `action` and `state-snapshot`.
- `action-request` is rejected when it is not join's turn.
- Snapshot `turn` is validated and used to track server-side turn gate.
