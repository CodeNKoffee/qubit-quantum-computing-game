import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let model;

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
}

export async function detectFace(video) {
  if (!model) return null;

  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: false,
    predictIrises: false
  });

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    const noseY = keypoints[4][1]; // Nose tip Y coordinate
    return noseY;
  }

  return null;
}