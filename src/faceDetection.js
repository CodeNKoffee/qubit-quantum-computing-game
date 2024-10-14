import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let model;
let lastDetectionTime = 0;

export async function initFaceDetection(videoElement) {
  await tf.setBackend('webgl');
  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    { maxFaces: 1 }
  );

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
  }
  console.log('Face detection initialized');
}

export async function detectFace(video) {
  if (!model) return null;

  const currentTime = Date.now();
  if (currentTime - lastDetectionTime < 100) {
    return null; // Limit detection to 10 times per second
  }
  lastDetectionTime = currentTime;

  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: false,
    predictIrises: false
  });

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    const noseY = keypoints[4][1]; // Nose tip Y coordinate
    console.log('Face detected, nose Y:', noseY);
    return noseY;
  }

  console.log('No face detected');
  return null;
}