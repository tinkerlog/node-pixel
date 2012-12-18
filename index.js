
var server = require("./server.js");
var router = require("./router.js");
var handlers = require("./handlers.js");
var sockets = require("./sockets.js");

var handler = {};
handler["/leds"] = handlers.leds;

server.start(router.routeHttp, handler);
sockets.start(server.app, handlers.handleSocket);
