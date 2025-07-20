/*
 * Draw a nice svg compass, based on codepen from Gary Homewood
 *
 * Copyright (c) 2016 by Gary Homewood (https://codepen.io/GaryHomewood/pen/EygNRa)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Also do compass stuff see below for bearing/heading
 *   // https://stackoverflow.com/a/21829819
 */
(function () {
  "use strict";

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("compass-graphic");

  const bearingElement = document.getElementById("bearing-value");
  const compassElement = document.getElementById("compass");

  if ('AbsoluteOrientationSensor' in window) {
    const sensor = new AbsoluteOrientationSensor();

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
    let orientation = quaternionToEuler(e.target.quaternion);
    let heading = compassHeading(orientation.yaw, orientation.pitch, orientation.roll) + 180;
    if (isNaN(heading)) {
      heading = 0;
    }

    compassElement.style.transform = `rotate(${-heading}deg)`;
    bearingElement.textContent = heading;
  }

  // Function to convert quaternion to euler angles
  // https://github.com/guilyx/quaternion2euler
  function quaternionToEuler(quaternion) {
    const x = quaternion[0];
    const y = quaternion[1];
    const z = quaternion[2];
    const w = quaternion[3];

    const ysqr = y * y;

    // Roll (x-axis rotation)
    const t0 = 2.0 * (w * x + y * z);
    const t1 = 1.0 - 2.0 * (x * x + ysqr);
    var roll = Math.atan2(t0, t1);

    // Pitch (y-axis rotation)
    let t2 = 2.0 * (w * y - z * x);
    t2 = t2 > 1.0 ? 1.0 : t2;
    t2 = t2 < -1.0 ? -1.0 : t2;
    var pitch = Math.asin(t2);

    // Yaw (z-axis rotation)
    const t3 = 2.0 * (w * z + x * y);
    const t4 = 1.0 - 2.0 * (ysqr + z * z);
    var yaw = Math.atan2(t3, t4);

    return {roll, pitch, yaw};
  }

  // https://stackoverflow.com/a/21829819
  // TODO check unused vars
  function compassHeading(alphaRad, betaRad, gammaRad) {

    // Calculate equation components
    var cA = Math.cos(alphaRad);
    var sA = Math.sin(alphaRad);
    // var cB = Math.cos(betaRad);
    var sB = Math.sin(betaRad);
    var cG = Math.cos(gammaRad);
    var sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    var rA = - cA * sG - sA * sB * cG;
    var rB = - sA * sG + cA * sB * cG;
    // var rC = - cB * cG;

    // Calculate compass heading
    var compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
      compassHeading += Math.PI;
    } else if (rA < 0) {
      compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;

    return compassHeading;
  }

}());
