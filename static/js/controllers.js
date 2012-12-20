'use strict';

/* Controllers */

function LedCtrl($scope, $http, socket) {

  var mouseDown = false;
  var currentLed;
  var lastX = 0;
  var lastY = 0;

  // fetch all leds from server at startup
  $http.get('leds').success(function(data) {
    $scope.leds = data;
  });

  $scope.startAnimation = function() {
    socket.emit("startAnimation", {});
  }

  $scope.stopAnimation = function() {
    socket.emit("stopAnimation", {});
  }

  // submit a changed led via socket
  $scope.submitLed = function(led) {
    /*
    $http({
      method: 'POST',
      url: "/led",
      data:  $.param({ id : led.id, r : led.r, g : led.g, b : led.b }),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (data, status, headers, config) {
    }).error(function (data, status, headers, config) {
      alert("failed");
    });
    */

    socket.emit("change:led", {
      id: led.id, r: led.r, g: led.g, b: led.b
    });
  }

  // handle incoming change events
  socket.on("changed:led", function(data) {
    var id = data.id;
    $scope.leds[id].r = data.r;
    $scope.leds[id].g = data.g;
    $scope.leds[id].b = data.b;
  });

  socket.on("update", function(data) {
    $scope.leds = data;
  });

  //--- mouse events -----

  $scope.mouseMove = function(event) {
    onLedMove(event.clientX, event.clientY);
  }
  
  $scope.mouseDown = function(led, event) {
    onLedDown(led, event.clientX, event.clientY);
    event.preventDefault();
  }

  $scope.mouseUp = function(event) {
    mouseDown = false;
  }

  $scope.mouseOut = function(event) {
    if (typeof event !== "undefined" && event.relatedTarget.id == "body") {
      mouseDown = false;
    }
  }


  //--- touch events on mobile -----

  $scope.touchStart = function(led, event) {
    onLedDown(led, event.touches[0].clientX, event.touches[0].clientY);
  }

  $scope.touchMove = function(event) {
    onLedMove(event.touches[0].clientX, event.touches[0].clientY);
    event.preventDefault();
  }

  function onLedDown(led, clientX, clientY) {
    mouseDown = true;
    lastX = clientX;
    lastY = clientY;
    currentLed = $scope.leds[led.id];
    if (typeof currentLed.hue === "undefined") {
      currentLed.hue = 0.5;
      currentLed.light = 0.5;
    }
  }

  function onLedMove(clientX, clientY) {
    if (mouseDown) {
      var deltaX = (clientX - lastX) / 200;
      var deltaY = (clientY - lastY) / 100;
      var newHue = currentLed.hue + deltaX;
      var newLight = currentLed.light + deltaY;
      currentLed.hue = (newHue > 0.0 && newHue < 1.0) ? newHue : currentLed.hue;
      currentLed.light = (newLight > 0.0 && newLight < 1.0) ? newLight : currentLed.light;
      var rgb = hsvToRgb(currentLed.hue, 1.0, currentLed.light);
      currentLed.r = rgb[0];
      currentLed.g = rgb[1];
      currentLed.b = rgb[2];
      $scope.submitLed(currentLed);
      lastX = clientX;
      lastY = clientY;
    }
  }

  function hsvToRgb(h, s, v){
    var r, g, b;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
    }
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
  }

}

