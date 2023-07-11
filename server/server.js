import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
const app = express();
const PORT = 8080;
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "PUT", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let socketToRoom = {};

const maximum = 2;
let users = {};

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    if (users[data.room]) {
      const length = users[data.room].length;
      if (length === maximum) {
        socket.to(socket.id).emit("room_full");
        return;
      }
      users[data.room].push({ id: socket.id });
    } else {
      users[data.room] = [{ id: socket.id }];
    }
    socketToRoom[socket.id] = data.room;
    socket.join(data.room);

    const usersInThisRoom = users[data.room].filter(
      (user) => user.id !== socket.id
    );
    io.sockets.to(socket.id).emit("all_users", usersInThisRoom);
  });

  socket.on("offer", (sdp) => {
    socket.broadcast.emit("getOffer", sdp);
  });

  socket.on("answer", (sdp) => {
    socket.broadcast.emit("getAnswer", sdp);
  });

  socket.on("candidate", (candidate) => {
    socket.broadcast.emit("getCandidate", candidate);
  });
  socket.on("video_state", (state) => {
    console.log(state);
    socket.broadcast.emit("return_video_state", state);
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((user) => user.id !== socket.id);
      users[roomID] = room;
      if (room.length === 0) {
        delete users[roomID];
        return;
      }
    }
    delete socketToRoom[socket.id];
    socket.broadcast.to(room).emit("user_exit", { id: socket.id });
  });
});

app.use(express.json());
app.get("/", (req, res) => {
  return res.json(server);
});

server.listen(PORT, () => {
  console.log(`server is runnging on ${PORT}`);
});
