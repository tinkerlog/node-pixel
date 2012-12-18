
// var formidable = require("formidable");
var util = require("util");
var sys = require('sys');

/*
var Pixel = require('adafruit_pixel').Pixel;
var pixels = new Pixel('/dev/spidev0.0', 25);
pixels.all(0, 0, 0);
pixels.sync();
*/

var leds = [];
for (var i = 0; i < 25; i++) {
  leds[i] = { id: i, r: 0, g: 0, b: 0 };
}

// send current leds as json
function renderLeds(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.write(JSON.stringify(leds));
  response.end();
}

/*
function postLed(request, response) {
  console.log("postLed");
  var led = {};
  var form = new formidable.IncomingForm();
  form.on('error', function(err) {
    response.writeHead(500, {'content-type': 'text/plain'});
    response.end('error:\n\n'+util.inspect(err));
    console.log('error: ' + util.inspect(err));
  });
  form.on('end', function() {
    console.log('-> post done');
    response.writeHead(200, {'content-type': 'text/plain'});
    response.end();
  });
  form.parse(request, function(err, fields, files) {
    console.log("updating led: " + fields.id + ", " + fields.r + ", " + fields.g + ", " + fields.b);
    leds[fields.id].r = parseInt(fields.r); 
    leds[fields.id].g = parseInt(fields.g); 
    leds[fields.id].b = parseInt(fields.b); 
    //pixels.set(fields.id, leds[fields.id].r, leds[fields.id].g, leds[fields.id].b);
    //pixels.sync();
  });
}
*/

// set a single led
function setPixel(id, r, g, b) {
  var ir = parseInt(r);
  var ig = parseInt(g);
  var ib = parseInt(b);
  leds[id].r = (ir < 0) ? 0 : (ir > 255) ? 255 : ir;
  leds[id].g = (ig < 0) ? 0 : (ig > 255) ? 255 : ig;
  leds[id].b = (ib < 0) ? 0 : (ib > 255) ? 255 : ib;
  //pixels.set(id, leds[id].r, leds[id].g, leds[id].b);
  //pixels.sync();
}

// handle change led events on the socket
function handleSocket(socket) {
  socket.on("change:led", function(data) {
    setPixel(data.id, data.r, data.g, data.b);
    // send the changed led to all other clients
    socket.broadcast.emit("changed:led", {
      id: data.id, r: leds[data.id].r, g: leds[data.id].g, b: leds[data.id].b
    }); 
  });
}

exports.leds = renderLeds;
exports.handleSocket = handleSocket;
