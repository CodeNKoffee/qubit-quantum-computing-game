import bgImage from './assets/qubit-game-bg.png'
import mascottImage from './assets/qubit-mascott.png';
import pipeImage from './assets/qubit-game-pipe.png';

let bird = { x: 50, y: 300, width: 40, height: 40, velocity: 0 };
let pipes = [];
let score = 0;
let gameWidth = 800;
let gameHeight = 600;
let bg, mascottImg, pipeImg;

export function initGame(ctx) {
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
    // Images loaded, start game loop
    requestAnimationFrame(() => updateGame(ctx, bird.y));
  });
}

export function startGame() {
  bird = { x: 50, y: 300, width: 40, height: 40, velocity: 0 };
  pipes = [];
  score = 0;
}

export function updateGame(ctx, faceY) {
  // Clear canvas
  ctx.clearRect(0, 0, gameWidth, gameHeight);

  // Draw background
  ctx.drawImage(bg, 0, 0, gameWidth, gameHeight);

  // Update bird position based on face position
  bird.y = faceY;

  // Draw bird
  ctx.drawImage(mascottImg, bird.x, bird.y, bird.width, bird.height);

  // Update and draw pipes
  if (pipes.length === 0 || pipes[pipes.length - 1].x < gameWidth - 300) {
    pipes.push({
      x: gameWidth,
      topHeight: Math.random() * (gameHeight - 300) + 50,
    });
  }

  pipes.forEach((pipe, index) => {
    pipe.x -= 2;

    // Draw pipes
    const pipeWidth = 80;
    ctx.drawImage(pipeImg, pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.drawImage(pipeImg, pipe.x, pipe.topHeight + 150, pipeWidth, gameHeight - pipe.topHeight - 150);

    // Check collision
    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipeWidth &&
      (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + 150)
    ) {
      startGame(); // Reset game on collision
    }

    // Score point
    if (pipe.x + pipeWidth < bird.x && !pipe.scored) {
      score++;
      pipe.scored = true;
    }

    // Remove off-screen pipes
    if (pipe.x < -pipeWidth) {
      pipes.splice(index, 1);
    }
  });

  // Draw score
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);

  return score;
}