import * as faceapi from 'face-api.js';

let isModelLoaded = false;

export async function initFaceDetection() {
  console.log('Initializing face detection...');
  
  if (!isModelLoaded) {
    try {
      await faceapi.nets.tinyFaceDetector.load('/models/');
      console.log('Model loaded successfully.');
      isModelLoaded = true;
    } catch (error) {
      console.error('Error loading face detection model:', error);
      throw new Error('Face detection model loading failed. Have you downloaded the model files?');
    }
  }
}

export const detectFace = async (videoElement) => {
  if (!isModelLoaded) {
    console.warn('Face detection model not loaded. Attempting to load...');
    try {
      await initFaceDetection();
    } catch (error) {
      console.error('Failed to load face detection model:', error);
      return null;
    }
  }

  if (!videoElement) {
    console.warn('Video element is not provided');
    return null;
  }

  try {
    const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions());
    console.log('Detections in JS:', detections);
    return detections;
  } catch (error) {
    console.error("Face detection error:", error);
    return null;
  }
};