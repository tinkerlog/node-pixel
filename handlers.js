
// var formidable = require("formidable");
var util = require("util");
var sys = require('sys');


var Pixel = require('adafruit_pixel').Pixel;
var pixels = new Pixel('/dev/spidev0.0', 25);
pixels.all(0, 0, 0);
pixels.sync();


var MAX_LEDS = 25;
var MAX_STEPS = 10;

var animation = {
  running: false,
  step: 0
};

var leds = [];
var ledBuffer = [];
for (var i = 0; i < MAX_LEDS; i++) {
  leds[i] = { id: i, r: 0, g: 0, b: 0 };
  ledBuffer[i] = {};
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
function setLed(id, r, g, b) {
  var ir = parseInt(r);
  var ig = parseInt(g);
  var ib = parseInt(b);
  leds[id].r = (ir < 0) ? 0 : (ir > 255) ? 255 : ir;
  leds[id].g = (ig < 0) ? 0 : (ig > 255) ? 255 : ig;
  leds[id].b = (ib < 0) ? 0 : (ib > 255) ? 255 : ib;
  pixels.set(id, leds[id].r, leds[id].g, leds[id].b);
  pixels.sync();
}

function syncLeds() {
  for (var i = 0; i < MAX_LEDS; i++) {
    var led = leds[i];
    pixels.set(i, led.r, led.g, led.b);
  }
  pixels.sync();
}

// handle change events on the socket
function changeLed(socket, led) {
  setLed(led.id, led.r, led.g, led.b);
  // send the changed led to all other clients
  socket.broadcast.emit("changed:led", {
    id: led.id, r: leds[led.id].r, g: leds[led.id].g, b: leds[led.id].b
  }); 
}

function startAnimation(socket, leds) {
  animation.running = true;
  animate(socket, leds);
}

function stopAnimation(socket) {
  animation.running = false;
  animation.step = 0;
  for (i = 0; i < leds.length; i++) {
    leds[i].r = ledBuffer[i].or;
    leds[i].g = ledBuffer[i].og;
    leds[i].b = ledBuffer[i].ob;
  }
  socket.emit("update", leds);
  syncLeds();
}

function animate(socket, leds) {
  if (!animation.running) {
    return;
  }
  if (animation.step == 0) {
    // save old values
    for (i = 0; i < leds.length; i++) {
      ledBuffer[i].or = leds[i].r;
      ledBuffer[i].og = leds[i].g;
      ledBuffer[i].ob = leds[i].b;      
      ledBuffer[i].r = leds[i].r;
      ledBuffer[i].g = leds[i].g;
      ledBuffer[i].b = leds[i].b;       
    } 
    // compute deltas
    for (i = 0; i < leds.length-1; i++) {
      ledBuffer[i].dr = (ledBuffer[i+1].or - ledBuffer[i].or) / MAX_STEPS;
      ledBuffer[i].dg = (ledBuffer[i+1].og - ledBuffer[i].og) / MAX_STEPS;
      ledBuffer[i].db = (ledBuffer[i+1].ob - ledBuffer[i].ob) / MAX_STEPS;
    }
    ledBuffer[leds.length-1].dr = (ledBuffer[0].or - ledBuffer[leds.length-1].or) / MAX_STEPS;
    ledBuffer[leds.length-1].dg = (ledBuffer[0].og - ledBuffer[leds.length-1].og) / MAX_STEPS;
    ledBuffer[leds.length-1].db = (ledBuffer[0].ob - ledBuffer[leds.length-1].ob) / MAX_STEPS;
    animation.step = MAX_STEPS;
    socket.emit("update", leds);
    socket.broadcast.emit("update", leds);
  }
  for (i = 0; i < leds.length; i++) {
    ledBuffer[i].r += ledBuffer[i].dr;
    ledBuffer[i].g += ledBuffer[i].dg;
    ledBuffer[i].b += ledBuffer[i].db;
    leds[i].r = Math.round(ledBuffer[i].r); 
    leds[i].g = Math.round(ledBuffer[i].g); 
    leds[i].b = Math.round(ledBuffer[i].b);
    //leds[i].b = Math.max(leds[i].b, 0.0); 
    //console.log("i: " + i + ", " + leds[i].b);
  }
  animation.step--;
  syncLeds();
  if (animation.running) {
    setTimeout(function() { 
      animate(socket, leds); 
    }, 100);
  }
}

// handle socket events
function handleSocket(socket) {
  socket.on("change:led", function(data) {
    changeLed(socket, data);
  });
  socket.on("startAnimation", function(data) {
    startAnimation(socket, leds);
  });
  socket.on("stopAnimation", function(data) {
    stopAnimation(socket);
  });
}

exports.leds = renderLeds;
exports.handleSocket = handleSocket;
