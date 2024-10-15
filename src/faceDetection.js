import * as faceDetection from '@tensorflow-models/face-detection';

let model;

export async function initFaceDetection(videoElement) {
  try {
    model = await faceDetection.load(faceDetection.SupportedModels.MediaPipeFaceDetector);
    videoElement.play(); // Ensure video playback starts after loading the stream
  } catch (error) {
    console.error('Face detection model faile d to load:', error);
  }
}

export async function detectFace(video) {
  if (!model) {
    console.error('Face detection model is not loaded');
    return null;
  }

  const faces = await model.estimateFaces({ input: video });
  
  if (faces.length > 0) {
    const noseY = faces[0].keypoints.find(point => point.name === 'noseTip')?.y;
    return noseY || null; // Return null if noseTip is not found
  }
  return null;
}