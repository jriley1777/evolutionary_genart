// server.js
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"]
  }
});

// Serve static files from the public directory
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("mouse", (data) => {
    console.log("mouse", data);
    // broadcast to all other clients
    socket.broadcast.emit("mouse", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});