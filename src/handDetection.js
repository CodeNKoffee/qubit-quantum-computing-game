import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs';

export async function detectHandGestures(video) {
  const model = await handpose.load();
  const predictions = await model.estimateHands(video);

  if (predictions.length > 0) {
    const hand = predictions[0];
    const yCoordinate = hand.landmarks[0][1]; // Index of landmark for palm

    const threshold = video.videoHeight / 2;
    if (yCoordinate < threshold - 30) {
      return -1; // Move qubit up
    } else if (yCoordinate > threshold + 30) {
      return 1; // Move qubit down
    }
  }
  return 0; // No movement
}