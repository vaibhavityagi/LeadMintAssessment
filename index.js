const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = 3000;

const rootRouter = require("./routes/index");

app.use(express.json());

app.use("/api", rootRouter);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// socket.io
io.on("connection", (socket) => {
  socket.on("user-message", (msg) => {
    io.emit("user-message", msg);
  });
});

// http
// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error occured");
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
