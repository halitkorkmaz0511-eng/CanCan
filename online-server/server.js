const http = require("node:http");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 8787);

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("CanCan WS server is running");
});

const wss = new WebSocketServer({ server });

const rooms = new Map();

const VALID_ACTION_TYPES = new Set(["board", "ability", "skip"]);

function normalizeRoomCode(code) {
  return String(code || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function getOrCreateRoom(roomCode) {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, {
      members: new Set(),
      hostWs: null,
      joinWs: null,
      latestTurn: 1,
      started: false
    });
  }
  return rooms.get(roomCode);
}

function getRoom(roomCode) {
  return rooms.get(roomCode) || null;
}

function roomOccupancyText(room) {
  return `${room.members.size}/2`;
}

function isValidAction(action) {
  if (!action || typeof action !== "object") {
    return false;
  }
  if (!VALID_ACTION_TYPES.has(action.type)) {
    return false;
  }
  if (action.type === "board") {
    if (!Number.isInteger(action.x) || !Number.isInteger(action.y)) {
      return false;
    }
    if (action.x < 0 || action.y < 0 || action.x > 30 || action.y > 30) {
      return false;
    }
  }
  return true;
}

function sendStateSync(ws, roomCode, message) {
  sendJson(ws, {
    type: "state-sync",
    roomCode,
    message
  });
}

function expectedTeamForRole(role) {
  return role === "host" ? 1 : 2;
}

function removeFromRoom(ws) {
  if (!ws.roomCode || !rooms.has(ws.roomCode)) {
    return;
  }
  const room = rooms.get(ws.roomCode);
  room.members.delete(ws);
  if (room.hostWs === ws) {
    room.hostWs = null;
  }
  if (room.joinWs === ws) {
    room.joinWs = null;
  }
  if (room.members.size === 0) {
    rooms.delete(ws.roomCode);
    return;
  }

  room.started = Boolean(room.hostWs && room.joinWs && room.started);
}

function sendJson(ws, payload) {
  if (ws.readyState !== ws.OPEN) {
    return;
  }
  ws.send(JSON.stringify(payload));
}

function broadcast(roomCode, payload, exceptWs = null) {
  const room = getRoom(roomCode);
  if (!room) {
    return;
  }
  for (const member of room.members) {
    if (member === exceptWs) {
      continue;
    }
    sendJson(member, payload);
  }
}

function clearSocketIdentity(ws) {
  ws.role = null;
  ws.roomCode = null;
}

function canSocketOperateInRoom(ws, roomCode, room) {
  return Boolean(roomCode && room && ws.roomCode === roomCode && room.members.has(ws));
}

function resolveActiveRoom(ws, packet) {
  const roomCode = normalizeRoomCode(packet.roomCode || ws.roomCode);
  const room = getRoom(roomCode);
  if (!canSocketOperateInRoom(ws, roomCode, room)) {
    return null;
  }
  return { roomCode, room };
}

function rejectIfNotRole(ws, roomCode, expectedRole, message) {
  if (ws.role === expectedRole) {
    return false;
  }
  sendStateSync(ws, roomCode, message);
  return true;
}

function handleJoinRoom(ws, packet) {
  const roomCode = normalizeRoomCode(packet.roomCode);
  if (!roomCode) {
    sendStateSync(ws, "", "Geçersiz oda kodu");
    return;
  }

  const incomingClientId = String(packet.clientId || "").trim();
  if (!incomingClientId) {
    sendStateSync(ws, roomCode, "clientId gerekli");
    return;
  }

  const incomingRole = packet.role === "join" ? "join" : "host";

  removeFromRoom(ws);

  ws.clientId = incomingClientId;
  ws.role = incomingRole;
  ws.roomCode = roomCode;

  const room = getOrCreateRoom(roomCode);
  if (incomingRole === "host" && room.hostWs && room.hostWs !== ws) {
    sendStateSync(ws, roomCode, "Bu odada zaten host var");
    clearSocketIdentity(ws);
    return;
  }
  if (incomingRole === "join" && room.joinWs && room.joinWs !== ws) {
    sendStateSync(ws, roomCode, "Bu odada zaten join oyuncusu var");
    clearSocketIdentity(ws);
    return;
  }

  room.members.add(ws);
  if (incomingRole === "host") {
    room.hostWs = ws;
  } else {
    room.joinWs = ws;
  }
  if (room.hostWs && room.joinWs) {
    room.started = true;
  }

  sendStateSync(ws, roomCode, `Odaya bağlandın (${roomOccupancyText(room)})`);
  broadcast(roomCode, {
    type: "peer-joined",
    roomCode,
    clientId: ws.clientId,
    role: ws.role
  }, ws);
}

function handleActionRequest(ws, packet, roomCode, room) {
  if (rejectIfNotRole(ws, roomCode, "join", "Sadece join oyuncusu action-request atabilir")) {
    return;
  }
  if (!room.started || !room.hostWs) {
    sendStateSync(ws, roomCode, "Host hazır değil");
    return;
  }
  if (!isValidAction(packet.action)) {
    sendStateSync(ws, roomCode, "Geçersiz hamle paketi");
    return;
  }
  if (room.latestTurn !== expectedTeamForRole(ws.role)) {
    sendStateSync(ws, roomCode, "Sıra sende değil");
    return;
  }

  sendJson(room.hostWs, {
    ...packet,
    roomCode
  });
}

function handleAction(ws, packet, roomCode) {
  if (rejectIfNotRole(ws, roomCode, "host", "Sadece host action yayabilir")) {
    return;
  }
  if (!isValidAction(packet.action)) {
    sendStateSync(ws, roomCode, "Geçersiz action paketi");
    return;
  }

  broadcast(roomCode, {
    ...packet,
    roomCode
  }, ws);
}

function handleStateSnapshot(ws, packet, roomCode, room) {
  if (rejectIfNotRole(ws, roomCode, "host", "Sadece host snapshot gönderebilir")) {
    return;
  }

  const snapshot = packet.state;
  if (!snapshot || typeof snapshot !== "object") {
    sendStateSync(ws, roomCode, "Geçersiz snapshot");
    return;
  }
  if (!Number.isInteger(snapshot.turn) || ![1, 2].includes(snapshot.turn)) {
    sendStateSync(ws, roomCode, "Snapshot turn alanı geçersiz");
    return;
  }

  room.latestTurn = snapshot.turn;
  room.started = Boolean(snapshot.started);
  broadcast(roomCode, {
    ...packet,
    roomCode
  }, ws);
}

function handlePacketByType(ws, packet) {
  if (packet.type === "join-room") {
    handleJoinRoom(ws, packet);
    return;
  }

  const activeRoom = resolveActiveRoom(ws, packet);
  if (!activeRoom) {
    return;
  }

  const { roomCode, room } = activeRoom;
  if (packet.type === "action-request") {
    handleActionRequest(ws, packet, roomCode, room);
    return;
  }
  if (packet.type === "action") {
    handleAction(ws, packet, roomCode);
    return;
  }
  if (packet.type === "state-snapshot") {
    handleStateSnapshot(ws, packet, roomCode, room);
  }
}

function parsePacket(raw) {
  try {
    return JSON.parse(String(raw));
  } catch (err) {
    console.warn("Invalid ws payload:", err);
    return null;
  }
}

wss.on("connection", ws => {
  ws.clientId = null;
  ws.role = null;
  ws.roomCode = null;

  ws.on("message", raw => {
    const packet = parsePacket(raw);
    if (!packet?.type) {
      return;
    }

    handlePacketByType(ws, packet);
  });

  ws.on("close", () => {
    const roomCode = ws.roomCode;
    const clientId = ws.clientId;
    removeFromRoom(ws);

    if (roomCode) {
      broadcast(roomCode, {
        type: "peer-left",
        roomCode,
        clientId
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`[CanCan WS] listening on :${PORT}`);
});
