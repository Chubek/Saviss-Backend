require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const colors = require("colors");
var createError = require("http-errors");
const http = require("http");
const app = express();

global.appRoot = path.resolve(__dirname);
global.envPath = path.join(appRoot, ".env");
global.users = [];

const server = http.createServer(app);

const io = require("socket.io")(server, {
  serveClient: false,
  path: "/socket",
  pingInterval: 10000,
  pingTimeout: 5000,
});

io.set("transports", [
  "websocket",
  "flashsocket",
  "htmlfile",
  "xhr-polling",
  "jsonp-polling",
  "polling",
]);
io.set("polling duration", 100);

io.use((socket, next) => {
  let token = socket.handshake.query.username;
  if (token) {
    return next();
  }
  return next(new Error("authentication error"));
});

io.on("connection", (client) => {
  console.log(client.handshake.query.username + " connected.");
  let token = client.handshake.query.username;
  client.join(client.handshake.query.sessionId);
  console.log(
    client.handshake.query.username +
      " joined " +
      client.handshake.query.sessionId
  );
  client.on("disconnect", () => {
    var clientid = client.id;
    console.log(
      client.handshake.query.username + " left the client " + client.id
    );
    console.log("Client ID: " + clientid);
    for (var i = 0; i < users.length; i++)
      if (users[i].id && users[i].id == clientid) {
        users.splice(i, 1);
        break;
      }
  });
  users.push({
    id: client.id,
    name: token,
  });
  client.on("typing", (data) => {
    console.log("typing emitted: " + data);
    io.emit("typing", data);
  });

  client.on("stoptyping", (data) => {
    console.log("stoptyping emitted: " + data);
    io.emit("stoptyping", data);
  });

  client.on("message", (data) => {
    console.log("message emitted: " + data);
    io.emit("message", data);
  });
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    createParentPath: true,
  })
);

const db = mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.error("MongoDB Connected".green.inverse))
  .catch((e) => console.error(`${e}`.underline.red));
mongoose.set("useFindAndModify", false);

app.use("/avatars", express.static(path.join(__dirname, "public/img/avatars")));

app.use("/listener", require("./routes/listener"));
app.use("/admin", require("./routes/admin"));
app.use("/blocked", require("./routes/blockedNumbers"));
app.use("/superAdmin", require("./routes/superAdmin"));
app.use("/session", require("./routes/pairings"));

/*app.get("/", function(req, res) {
  res.sendFile("index.html", { root: path.join(__dirname, "dist") });
});*/

const port = process.env.PORT;

server.listen(port, () =>
  console.error(`Server started on port ${server.address().port}`.blue.inverse)
);

module.exports = app;
