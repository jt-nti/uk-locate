/*
 * Draw a nice svg compass, based on codepen from Gary Homewood
 *
 * Copyright (c) 2016 by Gary Homewood (https://codepen.io/GaryHomewood/pen/EygNRa)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var svgNS = "http://www.w3.org/2000/svg";
var svg = document.getElementById("compass-graphic");

var pointer = document.createElementNS(svgNS, "polygon");
pointer.setAttributeNS(null, "points", "150,0 155,12 145,12");
pointer.setAttributeNS(null, "class", "north");
svg.appendChild(pointer);

drawCardinalDirection(143, 72, "N");
drawCardinalDirection(228, 158, "E");
drawCardinalDirection(143, 242, "S");
drawCardinalDirection(58, 158, "W");

for (var i = 0; i < 360; i += 2) {
  // draw degree lines
  var c = "degree"
  if (i % 30 == 0) {
    w = 3;
    if (i == 0) {
    c = "north"
    }
    y2 = 50;
  } else {
    w = 1;
    y2 = 45;
  }

  var l1 = document.createElementNS(svgNS, "line");
  l1.setAttributeNS(null, "x1", 150);
  l1.setAttributeNS(null, "y1", 30);
  l1.setAttributeNS(null, "x2", 150);
  l1.setAttributeNS(null, "y2", y2);
  l1.setAttributeNS(null, "class", c)
  l1.setAttributeNS(null, "stroke-width", w);
  l1.setAttributeNS(null, "transform", "rotate(" + i + ", 150, 150)");
  svg.appendChild(l1);

  // draw degree value every 30 degrees
  if (i % 30 == 0) {
    var t1 = document.createElementNS(svgNS, "text");
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
    var textNode = document.createTextNode(i);
    t1.appendChild(textNode);
    svg.appendChild(t1);
  }
}

function drawCardinalDirection(x, y, displayText) {
  var direction = document.createElementNS(svgNS, "text");
  direction.setAttributeNS(null, "x", x);
  direction.setAttributeNS(null, "y", y);
  direction.setAttributeNS(null, "font-size", "20px");
  direction.setAttributeNS(null, "font-weight", "600");
  if (displayText === "N") {
    direction.setAttributeNS(null, "class", "north");
  } else {
    direction.setAttributeNS(null, "class", "direction");
  }
  var textNode = document.createTextNode(displayText);
  direction.appendChild(textNode);
  svg.appendChild(direction);
}
