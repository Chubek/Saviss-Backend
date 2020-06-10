/*
var createError = require('http-errors');
const http = require("http");
var express = require('express');


var app = express();

const server = http.createServer(app);


global.users = [];
const io = require('socket.io')(server);

io.use((socket, next) => {
  let token = socket.handshake.query.username;
  if (token) {
    return next();
  }
  return next(new Error('authentication error'));
});

io.on('connection', (client) => {
  let token = client.handshake.query.username;
  client.on('disconnect', () => {
    var clientid = client.id;
    for (var i = 0; i < users.length; i++)
      if (users[i].id && users[i].id == clientid) {
        users.splice(i, 1);
        break;
      }
  });
  users.push({
    id: client.id,
    name: token
  });
  client.on('typing', (data) => {
    io.emit("typing", data)
  });

  client.on('stoptyping', (data) => {
    io.emit("stoptyping", data)
  });

  client.on('message', (data) => {
    io.emit("message", data)
  });

});


/*server.listen(process.env.PORT, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


module.exports = app;
*/