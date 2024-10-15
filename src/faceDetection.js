import * as faceDetection from '@tensorflow-models/face-detection';

let model;

export async function initFaceDetection(videoElement) {
  // Load the face detection model
  model = await faceDetection.load(faceDetection.SupportedModels.MediaPipeFaceDetector);

  // Access the user's camera stream
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = stream;
}

export async function detectFace(video) {
  const faces = await model.estimateFaces({ input: video });

  if (faces.length > 0) {
    // Find the Y coordinate of the nose tip
    const noseY = faces[0].keypoints.find(point => point.name === 'noseTip').y;
    return noseY;
  }
  return null;
}