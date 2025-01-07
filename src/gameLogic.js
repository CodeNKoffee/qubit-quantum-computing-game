let bird;
let pipes = [];
let score = 0;
let gameSpeed = 1;

export function initGame(ctx, width, height) {
  bird = {
    x: width / 4,
    y: height / 2,
    velocity: 0,
    gravity: 0.5,
    lift: -10,
    size: 32
  };

  pipes = [];
  score = 0;
}

export function startGame(width, height, speed = 1) {
  gameSpeed = speed;
  const pipeSpacing = 1500 / gameSpeed; // Adjust pipe spawn rate based on speed

  // Create new pipes at regular intervals
  setInterval(() => {
    if (pipes.length < 3) {
      const gap = 200;
      const pipeY = Math.random() * (height - gap - 100) + 50;
      pipes.push({
        x: width,
        y: pipeY,
        gap: gap,
        width: 50,
        counted: false
      });
    }
  }, pipeSpacing);
}

export function updateGame(ctx, isClapping, width, height) {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Update bird
  if (isClapping) {
    bird.velocity = bird.lift;
  }
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Keep bird in bounds
  if (bird.y > height - bird.size) {
    bird.y = height - bird.size;
    bird.velocity = 0;
  }
  if (bird.y < 0) {
    bird.y = 0;
    bird.velocity = 0;
  }

  // Draw bird
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Update and draw pipes
  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    pipe.x -= 5 * gameSpeed; // Adjust pipe movement speed

    // Remove pipes that are off screen
    if (pipe.x < -pipe.width) {
      pipes.splice(i, 1);
      continue;
    }

    // Draw pipes
    ctx.fillStyle = '#fff';
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
    ctx.fillRect(pipe.x, pipe.y + pipe.gap, pipe.width, height - (pipe.y + pipe.gap));

    // Check for collision
    if (
      bird.x + bird.size / 2 > pipe.x &&
      bird.x - bird.size / 2 < pipe.x + pipe.width &&
      (bird.y - bird.size / 2 < pipe.y || bird.y + bird.size / 2 > pipe.y + pipe.gap)
    ) {
      return { gameOver: true, score };
    }

    // Update score
    if (!pipe.counted && pipe.x + pipe.width < bird.x) {
      pipe.counted = true;
      score++;
    }
  }

  return { gameOver: false, score };
}