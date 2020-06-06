const express = require("express");
const http = require("http");
const WebSocket = require("ws");

function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });
  wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(data) {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    });
  });

  server.listen(3030, () => {
    console.log(`Server started on port ${server.address().port} :)`);
  });
}

module.exports = startServer;
