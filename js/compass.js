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

  const rotation = new Float32Array(16);

  const bearingElement = document.getElementById("bearing-value");
  // const compassElement = document.getElementById("compass");

  // TODO testing!
  // let orientation = quaternionToEuler([0.0017, -0.0024, -0.8434, 0.5373]);
  // console.log(orientation);
  // let heading = compassHeading(orientation);
  // console.log(heading);

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
    try {
      e.target.populateMatrix(rotation);

      console.log("Matrix");
      console.log(rotation)
    } catch(e) {
      // wot no rotation
    }

    // TODO the compass is borked at the moment so don't show bearings!
    let orientation = quaternionToEuler(e.target.quaternion);
    console.log("Euler");
    console.log(orientation);

    var heading = compassHeading(orientation[2], orientation[0], orientation[1]);
    if (isNaN(bearing)) {
      heading = θ;
    }
    bearingElement.textContent = heading;

    // TODO the compass is borked at the moment so don't show bearings!
    compassElement.style.transform = `rotate(${-heading}deg)`;
  }


  // MIT
  // https://github.com/al-ro/volumetrics
  /**
 * https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
 * @param {quaternion} q 
 * @returns array of 3 Euler angles [x, y, z]
 */
  function quaternionToEuler(q) {

    // roll (x-axis rotation)
    var sinr_cosp = 2 * (q[3] * q[0] + q[1] * q[2]);
    var cosr_cosp = 1 - 2 * (q[0] * q[0] + q[1] * q[1]);
    var x = Math.atan2(sinr_cosp, cosr_cosp);

    // pitch (y-axis rotation)
    var y;
    var sinp = 2 * (q[3] * q[1] - q[2] * q[0]);
    if (Math.abs(sinp) >= 1) {
      y = Math.copysign(Math.PI / 2, sinp); // use 90 degrees if out of range
    } else {
      y = Math.asin(sinp);
    }

    // yaw (z-axis rotation)
    var siny_cosp = 2 * (q[3] * q[2] + q[0] * q[1]);
    var cosy_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2]);
    var z = Math.atan2(siny_cosp, cosy_cosp);

    return [x, y, z];
  }

  // https://github.com/AR-js-org/AR.js/blob/master/aframe/src/location-based/gps-camera.js
  function compassHeading(alphaRad, betaRad, gammaRad) {
    // Convert degrees to radians
    // var alphaRad = alpha * (Math.PI / 180);
    // var betaRad = beta * (Math.PI / 180);
    // var gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    var cA = Math.cos(alphaRad);
    var sA = Math.sin(alphaRad);
    var sB = Math.sin(betaRad);
    var cG = Math.cos(gammaRad);
    var sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    var rA = -cA * sG - sA * sB * cG;
    var rB = -sA * sG + cA * sB * cG;

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
