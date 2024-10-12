let bird = { x: 50, y: 300, velocity: 0 };
let pipes = [];
let score = 0;
let gameWidth = 800;
let gameHeight = 600;

export function initGame(ctx) {
  // Load images, set up initial game state
  // This is a placeholder - you'll need to add actual image loading
}

export function startGame() {
  bird = { x: 50, y: 300, velocity: 0 };
  pipes = [];
  score = 0;
}

export function updateGame(ctx, faceY) {
  // Clear canvas
  ctx.clearRect(0, 0, gameWidth, gameHeight);

  // Update bird position based on face position
  bird.y = faceY;

  // Draw bird
  ctx.fillStyle = 'yellow';
  ctx.fillRect(bird.x, bird.y, 40, 40);

  // Update and draw pipes
  if (pipes.length === 0 || pipes[pipes.length - 1].x < gameWidth - 200) {
    pipes.push({
      x: gameWidth,
      topHeight: Math.random() * (gameHeight - 200) + 50,
    });
  }

  pipes.forEach((pipe, index) => {
    pipe.x -= 2;

    // Draw pipes
    ctx.fillStyle = 'green';
    ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
    ctx.fillRect(pipe.x, pipe.topHeight + 150, 50, gameHeight - pipe.topHeight - 150);

    // Check collision
    if (
      bird.x + 40 > pipe.x &&
      bird.x < pipe.x + 50 &&
      (bird.y < pipe.topHeight || bird.y + 40 > pipe.topHeight + 150)
    ) {
      startGame(); // Reset game on collision
    }

    // Score point
    if (pipe.x + 50 < bird.x && !pipe.scored) {
      score++;
      pipe.scored = true;
    }

    // Remove off-screen pipes
    if (pipe.x < -50) {
      pipes.splice(index, 1);
    }
  });

  // Draw score
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);

  return score;
}