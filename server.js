import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); // allow frontend

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId) || new Set();
    if (room.size >= 2) {
      socket.emit("roomFull");
      return;
    }
    socket.join(roomId);
    socket.emit("joined", { player: room.size });
    io.to(roomId).emit("playerCount", room.size);
  });

  socket.on("spin", (data) => {
    io.to(data.roomId).emit("spinResult", data);
  });

  socket.on("reset", (roomId) => {
    io.to(roomId).emit("resetGame");
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
