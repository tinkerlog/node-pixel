
var url = require("url");
var util = require("util");
var http = require("http");

var app;

function start(route, handler) {
  function onRequest(request, response) {
    var path = url.parse(request.url).pathname;
    console.log("request for: " + path);
    route(handler, path, request, response);
  }
  app = http.createServer(onRequest);
  app.listen(8888);
  exports.app = app;
  console.log("server started ...");
}


exports.start = start;

