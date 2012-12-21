node-pixel
==========

Use node.js on a Rpi to flip some RGB pixels.


## Prerequisites ##

Running Raspberry Pi with running [Occidentalis v0.2](http://learn.adafruit.com/adafruit-raspberry-pi-educational-linux-distro/). Other distros might work as well.

Have an [Adafruit RGB Pixels (WS2801)](http://www.adafruit.com/products/322) strand connected to your Raspi like shown [here](http://learn.adafruit.com/light-painting-with-raspberry-pi/hardware).
Other stripes may or may not work.

## Installation ##

Install node.js. I used a pre-compiled version of [v0.8.15](http://www.raspberrypi.org/phpBB3/viewtopic.php?f=34&t=24130).

Checkout node-pixel.

```
git checkout https://github.com/tinkerlog/node-pixel
```
You have to rebuild the spi module.
```
npm rebuild node_modules/spi
```


Install additional modules.

```
npm install node-static
npm install socket.io
npm install easing
```
 
## Demo ##

Start node.js

```
sudo node index.js
```

Point your browser to http://ip.of.your.raspi:8888/index.html.

Have fun.



