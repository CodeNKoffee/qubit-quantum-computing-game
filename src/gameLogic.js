import bgImage from './assets/qubit-game-bg.png';
import mascottImage from './assets/qubit-mascott.png';
import pipeImage from './assets/qubit-game-pipe.png';
import gameOverSoundFile from './assets/533034__evretro__8-bit-game-over-soundtune.wav';

let bird;
let pipes = [];
let score = 0;
let gameSpeed = 1;
let gameWidth, gameHeight;
let bg, mascottImg, pipeImg, gameOverSound;
let gameOverSoundPlayed = false;

const PIPE_WIDTH = 80;
const BIRD_WIDTH = 75;
const BIRD_HEIGHT = 60;
const PIPE_SPACING = 450;
const PIPE_SPEED = 4.5;
const GRAVITY = 0.6;
const JUMP_VELOCITY = -12;

export function initGame(ctx, width, height) {
  gameWidth = width;
  gameHeight = height;
  score = 0;

  // Initialize images
  bg = new Image();
  bg.src = bgImage;
  mascottImg = new Image();
  mascottImg.src = mascottImage;
  pipeImg = new Image();
  pipeImg.src = pipeImage;

  // Initialize audio
  gameOverSound = new Audio(gameOverSoundFile);

  // Initialize bird
  bird = {
    x: 150,
    y: height / 2,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    velocity: 0
  };

  pipes = [];

  // Return promise for asset loading
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

export function startGame(width, height, speed = 1) {
  gameSpeed = speed;
  gameWidth = width;
  gameHeight = height;

  // Reset game state
  bird = {
    x: 150,
    y: height / 2,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    velocity: 0
  };
  pipes = [];
  score = 0;
  gameOverSoundPlayed = false;
}

export function updateGame(ctx, isClapping, width, height, musicEnabled = true) {
  gameWidth = width;
  gameHeight = height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  ctx.drawImage(bg, 0, 0, gameWidth, gameHeight);

  // Update bird
  if (isClapping) {
    bird.velocity = JUMP_VELOCITY;
  }

  // Apply gravity
  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  // Keep bird in bounds
  if (bird.y + bird.height >= height) {
    bird.y = height - bird.height;
    bird.velocity = 0;
  }
  if (bird.y <= 0) {
    bird.y = 0;
    bird.velocity = 0;
  }

  // Draw bird (mascot)
  ctx.drawImage(mascottImg, bird.x, bird.y, bird.width, bird.height);

  // Manage pipes
  if (pipes.length === 0 || pipes[pipes.length - 1].x < width - PIPE_SPACING) {
    const topHeight = Math.random() * (height - 200) + 50;
    pipes.push({
      x: width,
      topHeight,
      bottomHeight: height - topHeight - 350,
      passed: false
    });
  }

  let gameOver = false;

  // Update and draw pipes
  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    pipe.x -= PIPE_SPEED * gameSpeed;

    // Draw top pipe (inverted)
    ctx.save();
    ctx.translate(pipe.x + PIPE_WIDTH / 2, pipe.topHeight);
    ctx.rotate(Math.PI);
    ctx.drawImage(pipeImg, -PIPE_WIDTH / 2, 0, PIPE_WIDTH, pipe.topHeight);
    ctx.restore();

    // Draw bottom pipe
    ctx.drawImage(pipeImg, pipe.x, pipe.topHeight + 350, PIPE_WIDTH, gameHeight - pipe.topHeight - 350);

    // Check for collision
    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + PIPE_WIDTH &&
      (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + 350)
    ) {
      gameOver = true;
      break;
    }

    // Update score
    if (pipe.x + PIPE_WIDTH < bird.x && !pipe.passed) {
      pipe.passed = true;
      score++;
    }

    // Remove pipes that are off screen
    if (pipe.x + PIPE_WIDTH < 0) {
      pipes.splice(i, 1);
    }
  }

  // Play game over sound only if music is enabled
  if (gameOver && !gameOverSoundPlayed && musicEnabled) {
    gameOverSound.play().catch(error => console.error('Error playing sound:', error));
    gameOverSoundPlayed = true;
  }

  // Draw score
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';

  return { gameOver, score };
}