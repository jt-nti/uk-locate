/*
 * Draw a nice svg compass, based on codepen from Gary Homewood
 *
 * Copyright (c) 2016 by Gary Homewood (https://codepen.io/GaryHomewood/pen/EygNRa)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Also do compass stuff see below for bearing/heading
 * See https://www.parkertimmins.com/2020/06/03/azimuth-altitude.html for
 * an explanation.
 */
(function () {
  "use strict";

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("compass-graphic");

  // const rotation = new Float32Array(16);

  const bearingElement = document.getElementById("bearing-value");
  const compassElement = document.getElementById("compass");

  // TODO just testing!
  // let tnorth = compassHeading([0.08, 0.00, 0.01, 1.00]);
  // let teast = compassHeading([0.03, -0.07, -0.86, 0.50]);
  // let tsouth = compassHeading([0.03, 0.08, 0.98, 0.17]);
  // let twest = compassHeading([0.02, 0.02, 0.67, 0.74]);
  // let tup = compassHeading([0.52, -0.39, -0.48, 0.59]);
  // let tdown = compassHeading([-0.66, 0.17, -0.17, 0.72]);
  // let trandom = compassHeading([-0.17, -0.44, -0.88, 0.06]);

  if ('AbsoluteOrientationSensor' in window) {
    const sensor = new AbsoluteOrientationSensor({ frequency: 6 });

    sensor.addEventListener("reading", (e) => handleOrientation(e));

    Promise.all([
      navigator.permissions.query({ name: "accelerometer" }),
      navigator.permissions.query({ name: "magnetometer" }),
      navigator.permissions.query({ name: "gyroscope" }),
    ]).then((results) => {
      if (results.every((result) => result.state === "granted")) {
        console.log("Have permission to use AbsoluteOrientationSensor.");
        drawCompass(true);
        sensor.start();
      } else {
        console.log("No permissions to use AbsoluteOrientationSensor.");
        drawCompass(false);
      }
    });
  } else {
    console.log("AbsoluteOrientationSensor not available.");
    drawCompass(false);
  }

  function drawCompass(showBearings) {
    if (showBearings) {
      const pointer = document.createElementNS(svgNS, "polygon");
      pointer.setAttributeNS(null, "points", "150,0 155,12 145,12");
      pointer.setAttributeNS(null, "class", "north");
      svg.appendChild(pointer);

      drawCardinalDirection(143, 72, "N");
      drawCardinalDirection(228, 158, "E");
      drawCardinalDirection(143, 242, "S");
      drawCardinalDirection(58, 158, "W");
    }

    for (var i = 0; i < 360; i += 2) {
      // draw degree lines
      var w = 1;
      var y2 = 45;
      var c = "degree"
      if (showBearings && i % 30 == 0) {
        w = 3;
        if (i == 0) {
          c = "north"
        }
        y2 = 50;
      }

      const l1 = document.createElementNS(svgNS, "line");
      l1.setAttributeNS(null, "x1", 150);
      l1.setAttributeNS(null, "y1", 30);
      l1.setAttributeNS(null, "x2", 150);
      l1.setAttributeNS(null, "y2", y2);
      l1.setAttributeNS(null, "class", c)
      l1.setAttributeNS(null, "stroke-width", w);
      l1.setAttributeNS(null, "transform", "rotate(" + i + ", 150, 150)");
      svg.appendChild(l1);

      // draw degree value every 30 degrees
      if (showBearings && i % 30 == 0) {
        const t1 = document.createElementNS(svgNS, "text");
        if (i > 100) {
          t1.setAttributeNS(null, "x", 140);
        } else if (i > 0) {
          t1.setAttributeNS(null, "x", 144);
        } else {
          t1.setAttributeNS(null, "x", 147);
        }
        t1.setAttributeNS(null, "y", 24);
        t1.setAttributeNS(null, "font-size", "11px");
        t1.setAttributeNS(null, "font-weight", "300");
        if (i == 0) {
          t1.setAttributeNS(null, "class", "north")
        } else {
          t1.setAttributeNS(null, "class", "degree")
        }
        t1.setAttributeNS(null, "style", "letter-spacing:1.0");
        t1.setAttributeNS(null, "transform", "rotate(" + i + ", 150, 150)");
        const textNode = document.createTextNode(i);
        t1.appendChild(textNode);
        svg.appendChild(t1);
      }
    }
  }

  function drawCardinalDirection(x, y, displayText) {
    const direction = document.createElementNS(svgNS, "text");
    direction.setAttributeNS(null, "x", x);
    direction.setAttributeNS(null, "y", y);
    direction.setAttributeNS(null, "font-size", "20px");
    direction.setAttributeNS(null, "font-weight", "600");
    if (displayText === "N") {
      direction.setAttributeNS(null, "class", "north");
    } else {
      direction.setAttributeNS(null, "class", "direction");
    }
    const textNode = document.createTextNode(displayText);
    direction.appendChild(textNode);
    svg.appendChild(direction);
  }

  function handleOrientation(e) {
    var heading = compassHeading(e.target.quaternion);
    if (isNaN(heading)) {
      heading = "θ";
    } else {
      compassElement.style.transform = `rotate(${-heading}deg)`;
    }

    bearingElement.textContent = heading;
  }

  // https://github.com/IndoorAtlas/cordova-plugin/blob/8df9279bd75aabff78c8d2f34fcbf44d62a38844/www/Orientation.js
  // Copyright 2016 IndoorAtlas
  function compassHeading(q) {
    const qw = q[3];
    const qx = q[0];
    const qy = q[1];
    const qz = q[2];

    const yawRad = -Math.atan2(2.0 * (qw * qz + qx * qy), 1.0 - 2.0 * (qy * qy + qz * qz));

    const yawDeg = yawRad / Math.PI * 180.0;

    const compassHeading = (yawDeg + 360) % 360;

    return compassHeading.toFixed(0);;
  }
}());
