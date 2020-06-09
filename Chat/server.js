const express = require("express");
const http = require("http");
const WebSocket = require("ws");
let clients = {};

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws, req) {
  const userID = parseInt(req.url.substr(1), 10);
  clients[userID] = wss;
  console.log(
    "connected: " + userID + " in " + Object.getOwnPropertyNames(wss)
  );
  ws.on("message", function incoming(data) {
    console.log("received from " + userID + ": " + data);
    const messageArray = JSON.parse(data);
    const toUserWebSocket = clients[messageArray[0]];
    if (toUserWebSocket) {
      console.log(
        "sent to " + messageArray[0] + ": " + JSON.stringify(messageArray)
      );
      messageArray[0] = userID;
      toUserWebSocket.send(JSON.stringify(messageArray));
    }
  });
});

server.listen(process.env.WS_PORT, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});

module.exports = server;
