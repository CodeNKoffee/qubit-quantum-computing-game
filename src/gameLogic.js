import bgImage from './assets/qubit-game-bg.png';
import mascottImage from './assets/qubit-mascott.png';
import pipeImage from './assets/qubit-game-pipe.png';

let qubit, pipes, score, gameWidth, gameHeight, bg, mascottImg, pipeImg;
let lastFaceY;
const smoothingFactor = 0.5;
const pipeSpeed = 5;  // Increased pipe speed
// const pipeDistance = 200;  // Closer pipes

export function initGame(ctx, width, height) {
  gameWidth = width;
  gameHeight = height;
  
  // Load images
  bg = new Image();
  bg.src = bgImage;
  mascottImg = new Image();
  mascottImg.src = mascottImage;
  pipeImg = new Image();
  pipeImg.src = pipeImage;

  // Wait for images to load
  Promise.all([
    new Promise(resolve => bg.onload = resolve),
    new Promise(resolve => mascottImg.onload = resolve),
    new Promise(resolve => pipeImg.onload = resolve)
  ]).then(() => {
    console.log('All images loaded successfully');
    startGame(width, height);  // Ensure this fires only after images are loaded
    requestAnimationFrame(() => updateGame(ctx, qubit.y, width, height));
  }).catch(error => {
    console.error('Error loading images:', error);
  });
}

export function startGame(width, height) {
  gameWidth = width;
  gameHeight = height;
  qubit = { x: 150, y: height / 2, width: 75, height: 60, velocity: 0 };
  pipes = [];
  score = 0;
  lastFaceY = height / 2;
}

export function updateGame(ctx, faceY, width, height, gameState) {
  gameWidth = width;
  gameHeight = height;

  // Clear canvas
  ctx.clearRect(0, 0, gameWidth, gameHeight);

  // Draw background
  ctx.drawImage(bg, 0, 0, gameWidth, gameHeight);

  if (gameState === 'playing') {
    // Smooth out the qubit's movement based on face detection
    if (faceY !== null) {
      const targetY = faceY - qubit.height / 2; // Center the qubit on the detected nose
      qubit.y += (targetY - qubit.y) * smoothingFactor;
    } else {
      qubit.y += (lastFaceY - qubit.y) * smoothingFactor;
    }
    lastFaceY = qubit.y;
  } else if (gameState === 'gameover') {
    // AI-controlled qubit movement during gameover state
    // You can add more complex movement here, such as random jumps or smooth oscillation
    qubit.y += Math.sin(Date.now() / 500) * 2; // Simple sine wave movement for AI
  }

  // Prevent the qubit from going out of bounds
  qubit.y = Math.max(0, Math.min(qubit.y, gameHeight - qubit.height));

  // Draw qubit
  ctx.drawImage(mascottImg, qubit.x, qubit.y, qubit.width, qubit.height);

  // Update and draw pipes only if the game is not over
  if (gameState === 'playing') {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < gameWidth - 300) {
      pipes.push({
        x: gameWidth,
        topHeight: Math.random() * (gameHeight - 300) + 50,
        passed: false // New property to track if the qubit has passed the pipe
      });
    }

    let collisionDetected = false;

    pipes.forEach((pipe, index) => {
      pipe.x -= pipeSpeed;

      // Draw pipes
      const pipeWidth = 80;
      ctx.save();
      ctx.translate(pipe.x + pipeWidth / 2, pipe.topHeight);
      ctx.rotate(Math.PI);
      ctx.drawImage(pipeImg, -pipeWidth / 2, 0, pipeWidth, pipe.topHeight);
      ctx.restore();
      ctx.drawImage(pipeImg, pipe.x, pipe.topHeight + 150, pipeWidth, gameHeight - pipe.topHeight - 150);

      // Check collision
      if (
        qubit.x + qubit.width > pipe.x && qubit.x < pipe.x + pipeWidth &&
        (qubit.y < pipe.topHeight || qubit.y + qubit.height > pipe.topHeight + 150)
      ) {
        collisionDetected = true; // Set collision flag
      }

      // Check if qubit passed the pipe and increase score only if playing
      if (gameState === 'playing' && !pipe.passed && pipe.x + pipeWidth < qubit.x) {
        pipe.passed = true;
        score++;
      }

      // Remove pipes that have moved out of view
      if (pipe.x + pipeWidth < 0) {
        pipes.splice(index, 1);
      }
    });

    if (collisionDetected) {
      return null; // Return null if collision detected (end game)
    }
  }

  return score;
}