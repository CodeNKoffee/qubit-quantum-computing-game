import { useRef, useEffect, useState, useCallback } from 'react';
import { initGame, updateGame, startGame } from './gameLogic';
import bgImage from './assets/qubit-game-bg.png';

function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [error, setError] = useState(null);
  
  // Move lastFrameData to a ref to maintain state across renders
  const lastFrameDataRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const detectMotion = useCallback((video) => {
    if (!video) return 0;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);
    
    const currentFrameData = ctx.getImageData(0, 0, width, height).data;
    
    if (lastFrameDataRef.current) {
      const movement = calculateFrameDifference(currentFrameData, lastFrameDataRef.current);
      lastFrameDataRef.current = currentFrameData; // Update lastFrameData
      return movement;
    }

    lastFrameDataRef.current = currentFrameData; // Initialize on first frame
    return 0; // No movement on the first frame
  }, []);

  const calculateFrameDifference = (currentData, lastData) => {
    let totalDifference = 0;

    for (let i = 0; i < currentData.length; i += 4) {
      const diff =
        Math.abs(currentData[i] - lastData[i]) +
        Math.abs(currentData[i + 1] - lastData[i + 1]) +
        Math.abs(currentData[i + 2] - lastData[i + 2]);
      
      if (diff > 50) totalDifference++; // Adjust threshold for sensitivity
    }

    return totalDifference > 1000 ? 1 : (totalDifference < 500 ? -1 : 0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    initGame(ctx, canvasSize.width, canvasSize.height);

    let animationFrameId;
    let lastFaceY = canvasSize.height / 2;

    const gameLoop = () => {
      if (gameState === 'playing') {
        const movement = detectMotion(videoRef.current);
        if (movement !== 0) {
          const adjustment = movement * 20; // Adjust speed multiplier
          lastFaceY += adjustment;
          lastFaceY = Math.max(0, Math.min(lastFaceY, canvasSize.height));
        }

        const gameStatus = updateGame(ctx, lastFaceY, canvasSize.width, canvasSize.height);
        
        if (gameStatus.gameOver) {
          setGameState('gameover');
          cancelAnimationFrame(animationFrameId);
        } else {
          setScore(gameStatus.score);
        }
      }

      if (gameState === 'playing' || gameState === 'gameover') {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    if (gameState === 'playing') {
      gameLoop();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, canvasSize, detectMotion]);

  const handleStartClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        setGameState('playing');
        startGame(canvasSize.width, canvasSize.height);
      };
    } catch (error) {
      console.error('Camera access denied or error occurred:', error);
      setError('Camera access is required to play the game. The game will start without face detection.');
      setGameState('playing');
      startGame(canvasSize.width, canvasSize.height);
    }
  };

  const handleRestart = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }

    setScore(0);
    setGameState('start');
    setError(null);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
      <video
        ref={videoRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0 }}
        autoPlay
      />
  
      {(gameState === 'start' || gameState === 'gameover') && (
        <img src={bgImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} alt="Background" />
      )}
  
      {gameState === 'start' && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}>
          <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '20px' }}>Quantum Flappy Face</h1>
          <button
            onClick={handleStartClick}
            style={{
              fontSize: '20px',
              padding: '10px 20px',
              margin: '20px',
              backgroundColor: 'purple',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
            Start Game
          </button>
        </div>
      )}
  
      {gameState === 'gameover' && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}>
          <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '20px' }}>Game Over</h1>
          <h2 style={{ color: 'white', fontSize: '32px', marginBottom: '20px' }}>Final Score: {score}</h2>
          <button
            onClick={handleRestart}
            style={{
              fontSize: '20px',
              padding: '10px 20px',
              margin: '20px',
              backgroundColor: 'purple',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
            Restart Game
          </button>
        </div>
      )}
  
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          top: '20px', left: '20px',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '16px'
        }}>
          Quantum Score: {score}
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'red',
          fontSize: '24px',
          fontWeight: 'bold',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default App;