import * as facemesh from "@tensorflow-models/facemesh";

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Define a function that returns the vertical movement value based on the face landmarks.
async function getVerticalMovement() {
  const model = await facemesh.load();
  const video = document.querySelector("video");
  const faces = await model.estimateFaces(video);

  if (faces.length > 0) {
    const face = faces[0];
    const noseLandmark = face.scaledMesh[4];
    const noseY = noseLandmark[1];
    const threshold = 100;

    if (noseY < threshold) {
      return -1; // Move character up.
    } else if (noseY > threshold) {
      return 1; // Move character down.
    }
  }

  return 0; // No movement.
}

// Use the throttled version of getVerticalMovement
const throttledGetMovement = throttle(getVerticalMovement, 200);

export default throttledGetMovement;