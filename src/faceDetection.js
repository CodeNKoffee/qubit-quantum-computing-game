import '@tensorflow/tfjs';
import * as facemesh from "@tensorflow-models/facemesh";

let model = null;

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
  try {
    if (!model) {
      model = await facemesh.load();
    }
    const video = document.querySelector("video");
    if (!video) {
      console.error("Video element not found");
      return 0;
    }
    const faces = await model.estimateFaces(video);

    if (faces.length > 0) {
      const face = faces[0];
      const noseLandmark = face.scaledMesh[4];
      const noseY = noseLandmark[1];
      const threshold = video.videoHeight / 2; // Use half of video height as threshold

      if (noseY < threshold - 50) {
        return -1; // Move character up.
      } else if (noseY > threshold + 50) {
        return 1; // Move character down.
      }
    }
  } catch (error) {
    console.error("Error in face detection:", error);
  }

  return 0; // No movement.
}

// Use the throttled version of getVerticalMovement
const throttledGetMovement = throttle(getVerticalMovement, 200);

export default throttledGetMovement;