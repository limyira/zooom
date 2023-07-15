import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import bodyParser from "body-parser";
import twilio from "twilio";
dotenv.config();
const app = express();
const PORT = 7000;
const sid = process.env.SID;
const token = process.env.AUTH_TOKEN;
const client = twilio(sid, token);
app.use(
  cors({
    origin: "https://zooom-peach.vercel.app",
    methods: ["GET", "PUT", "POST"],
  })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const server = http.createServer(app);
const io = new Server(Server, {
  cors: {
    origin: "https://zooom-peach.vercel.app",
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

  socket.on("disconnecting", () => {
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
    socket.broadcast.emit("user_exit", { id: socket.id });
  });
});

app.get("/", (req, res) => {
  return res.json(server);
});
app.post("/api/message", (req, res) => {
  const { text } = req.body;
  if (text) {
    console.log(text);
    try {
      client.messages
        .create({
          body: text,
          from: process.env.FROM_NUMBER,
          to: process.env.TO_NUMBER,
        })
        .then((message) => console.log(message.sid));

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ message: "text가 존재하지 않습니다." });
    }
  } else {
    return res
      .status(500)
      .json({ message: "메세지가 제대로 전송되지 못했습니다." });
  }
});

server.listen(PORT, () => {
  console.log(`server is runnging on ${PORT}`);
});
