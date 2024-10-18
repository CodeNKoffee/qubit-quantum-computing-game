import bgImage from './assets/qubit-game-bg.png';
import mascottImage from './assets/qubit-mascott.png';
import pipeImage from './assets/qubit-game-pipe.png';

let qubit, pipes, gameWidth, gameHeight, bg, mascottImg, pipeImg, score;
const smoothingFactor = 0.5;
const pipeSpeed = 5;

export function initGame(ctx, width, height) {
  gameWidth = width;
  gameHeight = height;
  score = 0;

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
    startGame(width, height);
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
}

export function updateGame(ctx, faceY, width, height) {
  gameWidth = width;
  gameHeight = height;

  // Draw background
  ctx.drawImage(bg, 0, 0, gameWidth, gameHeight);

  // Update qubit position based on faceY
  if (faceY) {
    qubit.y += (faceY - qubit.y) * smoothingFactor;
  }

  // Limit qubit's vertical position
  qubit.y = Math.max(0, Math.min(qubit.y, height - qubit.height));

  // Draw qubit
  ctx.drawImage(mascottImg, qubit.x, qubit.y, qubit.width, qubit.height);

  // Manage pipes
  if (pipes.length === 0 || pipes[pipes.length - 1].x < width - 300) {
    const topHeight = Math.random() * (height - 200) + 50;
    pipes.push({ x: width, topHeight, bottomHeight: height - topHeight - 150, passed: false });
  }

  let gameOver = false;

  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= pipeSpeed;

    // Draw pipes (inverted top pipes)
    const pipeWidth = 80;
    ctx.save();
    ctx.translate(pipes[i].x + pipeWidth / 2, pipes[i].topHeight);
    ctx.rotate(Math.PI);
    ctx.drawImage(pipeImg, -pipeWidth / 2, 0, pipeWidth, pipes[i].topHeight);
    ctx.restore();
    ctx.drawImage(pipeImg, pipes[i].x, pipes[i].topHeight + 150, pipeWidth, gameHeight - pipes[i].topHeight - 150);

    // Collision detection
    if (
      qubit.x + qubit.width > pipes[i].x && qubit.x < pipes[i].x + pipeWidth &&
      (qubit.y < pipes[i].topHeight || qubit.y + qubit.height > pipes[i].topHeight + 150)
    ) {
      gameOver = true;
      break;  // Exit the loop immediately if there's a collision
    }

    // Increment score if pipe is passed
    if (pipes[i].x + pipeWidth < qubit.x && !pipes[i].passed) {
      pipes[i].passed = true;
      score++;
    }

    // Remove off-screen pipes
    if (pipes[i].x + pipeWidth < 0) {
      pipes.splice(i, 1);
    }
  }

  if (gameOver) {
    return { gameOver: true, score };
  }

  return { gameOver: false, score };
}