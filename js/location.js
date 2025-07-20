/*
 * It would be nice to use the AbsoluteOrientationSensor API, unfortunately
 * that's not widely supported:
 *   https://developer.mozilla.org/en-US/docs/Web/API/AbsoluteOrientationSensor
 * 
 * There is a pollyfill but it depends on another pollyfill to load the
 * pollyfill and that pollyfill has been archived!
 *   https://github.com/kenchris/sensor-polyfills
 * 
 * Try this...
 *   https://stackoverflow.com/questions/61336948/calculating-the-cardinal-direction-of-a-smartphone-with-js
 * 
 * See also:
 * https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi
 */
(function () {
  const startBtn = document.querySelector(".start-btn");
  const isIOS =
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/);

  // const compassElement = document.getElementById("compass");
  // const bearingElement = document.getElementById("bearing-value");
  const gridElement = document.getElementById("grid-value");
  const eastingElement = document.getElementById("easting-value");
  const northingElement = document.getElementById("northing-value");

  function error() {
    console.log("Error watching position.");
  }

  const options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000,
  };

  // TODO test that navigator.geolocation exists
  navigator.geolocation.watchPosition(locationHandler, error, options);


  // function init() {
  // startBtn.addEventListener("click", startCompass);
  // navigator.geolocation.getCurrentPosition(locationHandler);

  // if (!isIOS) {
  //   window.addEventListener("deviceorientationabsolute", compassHandler, true);
  // }
  // }

  // function startCompass() {
  //   if (isIOS) {
  //     DeviceOrientationEvent.requestPermission()
  //       .then((response) => {
  //         if (response === "granted") {
  //           window.addEventListener("deviceorientation", compassHandler, true);
  //         } else {
  //           alert("has to be allowed!");
  //         }
  //       })
  //       .catch(() => alert("not supported"));
  //   }
  // }

  // function compassHandler(e) {
  //   let compassHeading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
  //   if (compassHeading === 360) {
  //     compassHeading = 0;
  //   }
  //   compassElement.style.transform = `rotate(${-compassHeading}deg)`;
  //   bearingElement.textContent = compassHeading;
  // }

  function locationHandler(position) {
    const { latitude, longitude } = position.coords;

    // TODO: convert to UK grid coordinates!

    gridElement.textContent = "TBC";
    eastingElement.textContent = longitude;
    northingElement.textContent = latitude;
  }

  // init();
}());


// if (window.DeviceOrientationEvent) {
//   // Listen for the deviceorientation event and handle the raw data
//   window.addEventListener('deviceorientation', function(eventData) {
//     var compassdir;

//     if(event.webkitCompassHeading) {
//       // Apple works only with this, alpha doesn't work
//       compassdir = event.webkitCompassHeading;
//     }
//     else compassdir = event.alpha;
//   });
// }
