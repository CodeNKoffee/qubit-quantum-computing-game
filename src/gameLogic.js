import bgImage from './assets/qubit-game-bg.png';
import mascottImage from './assets/qubit-mascott.png';
import pipeImage from './assets/qubit-game-pipe.png';
import gameOverSoundFile from './assets/533034__evretro__8-bit-game-over-soundtune.wav';

let qubit, pipes, gameWidth, gameHeight, bg, mascottImg, pipeImg, score;
const gravity = 0.6;
const jumpVelocity = -12;
const pipeSpeed = 5;
const pipeSpacing = 300;
let gameOverSound;
let gameOverSoundPlayed = false;

export function initGame(ctx, width, height) {
  gameWidth = width;
  gameHeight = height;
  score = 0;

  bg = new Image();
  bg.src = bgImage;
  mascottImg = new Image();
  mascottImg.src = mascottImage;
  pipeImg = new Image();
  pipeImg.src = pipeImage;

  // Initialize the audio
  gameOverSound = new Audio(gameOverSoundFile);

  return new Promise((resolve, reject) => {
    Promise.all([
      new Promise(res => bg.onload = res),
      new Promise(res => mascottImg.onload = res),
      new Promise(res => pipeImg.onload = res)
    ]).then(() => {
      console.log('All images loaded successfully');
      resolve();
    }).catch(error => {
      console.error('Error loading images:', error);
      reject(error);
    });
  });
}

export function startGame(width, height) {
  gameWidth = width;
  gameHeight = height;
  qubit = { x: 150, y: height / 2, width: 75, height: 60 };
  pipes = [];
  score = 0;
  gameOverSoundPlayed = false;
}

export function updateGame(ctx, isClapping, width, height) {
  gameWidth = width;
  gameHeight = height;

  // Apply upward velocity if clapping is detected
  if (isClapping) {
    qubit.velocity = jumpVelocity;
  }

  // Apply gravity to the qubit
  qubit.velocity = (qubit.velocity || 0) + gravity;

  // Update qubit's position based on velocity
  qubit.y += qubit.velocity;

  // Prevent the qubit from going below the ground
  if (qubit.y + qubit.height >= height) {
    qubit.y = height - qubit.height;
    qubit.velocity = 0;
  }

  // Prevent qubit from going off the top of the screen
  if (qubit.y <= 0) {
    qubit.y = 0;
    qubit.velocity = 0;
  }

  // Draw background
  ctx.drawImage(bg, 0, 0, gameWidth, gameHeight);

  // Draw qubit (mascott)
  ctx.drawImage(mascottImg, qubit.x, qubit.y, qubit.width, qubit.height);

  // Manage pipes
  if (pipes.length === 0 || pipes[pipes.length - 1].x < width - pipeSpacing) {
    const topHeight = Math.random() * (height - 200) + 50;
    pipes.push({ x: width, topHeight, bottomHeight: height - topHeight - 350, passed: false });
  }

  let gameOver = false;

  // Loop through pipes
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= pipeSpeed;

    // Draw pipes
    const pipeWidth = 80;
    ctx.save();
    ctx.translate(pipes[i].x + pipeWidth / 2, pipes[i].topHeight);
    ctx.rotate(Math.PI);
    ctx.drawImage(pipeImg, -pipeWidth / 2, 0, pipeWidth, pipes[i].topHeight);
    ctx.restore();
    ctx.drawImage(pipeImg, pipes[i].x, pipes[i].topHeight + 350, pipeWidth, gameHeight - pipes[i].topHeight - 350);

    // Collision detection
    if (
      qubit.x + qubit.width > pipes[i].x &&
      qubit.x < pipes[i].x + pipeWidth &&
      (qubit.y < pipes[i].topHeight || qubit.y + qubit.height > pipes[i].topHeight + 350)
    ) {
      gameOver = true;
      break;
    }

    // Increment score if pipe is passed
    if (pipes[i].x + pipeWidth < qubit.x && !pipes[i].passed) {
      pipes[i].passed = true;
      score += 1;
    }

    // Remove pipes that go off screen
    if (pipes[i].x + pipeWidth < 0) {
      pipes.splice(i, 1);
    }
  }

  // Play game over sound if game is over and it hasn't played yet
  if (gameOver && !gameOverSoundPlayed) {
    gameOverSound.play().catch(error => console.error('Error playing sound:', error));
    gameOverSoundPlayed = true;
  }

  // Draw score
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';

  return { gameOver, score };
}