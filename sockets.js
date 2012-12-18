
var socket = require("socket.io");

function start(app, handleSocket) {
  var io = socket.listen(app);
  io.set('log level', 1);  
  io.sockets.on("connection", function(socket) {
    handleSocket(socket);
  });
  console.log("socket started ...");
}

exports.start = start;