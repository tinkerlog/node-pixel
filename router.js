
var static = require('node-static');

var webroot = "./static";
var file = new(static.Server)(webroot, {
  cache: 600,
  headers: { 'X-Powered-By': 'node-static' }
});

// route incoming requests
function routeHttp(handler, path, request, response) {
  //console.log("routing for: " + path);
  // if there is a function for that path, call it
  if (typeof handler[path] === 'function') {
    handler[path](request, response);
  }
  else {
    // otherwise try to serve a file
    file.serve(request, response, function(err, result) {
      if (err) {
        console.error('Error serving %s - %s', request.url, err.message);
        response.writeHead(err.status, err.headers);
	response.write("404 not found");
        response.end();
      } 
      else {
        console.log('%s - %s', request.url, response.message);
      }
    });
  }
}

exports.routeHttp = routeHttp;
