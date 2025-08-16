// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

// serve index.html
app.use(express.static(__dirname));

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size >= 2) {
      socket.emit("roomFull");
    } else {
      socket.join(roomId);
    }
  });

  socket.on("spin", ({ roomId, rotation, outcome, player }) => {
    socket.to(roomId).emit("spinResult", { rotation, outcome, player });
  });

  socket.on("reset", (roomId) => {
    io.to(roomId).emit("resetGame");
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
