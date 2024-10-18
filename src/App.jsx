import { useRef, useEffect, useState } from 'react';
import { initGame, updateGame, startGame } from './gameLogic';
import throttledGetMovement from './faceDetection';
import bgImage from './assets/qubit-game-bg.png';

function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    initGame(ctx, canvasSize.width, canvasSize.height);

    let animationFrameId;
    let lastFaceY = canvasSize.height / 2;

    const gameLoop = async () => {
      if (gameState === 'playing') {
        try {
          const movement = await throttledGetMovement();
          if (movement !== 0) {
            const adjustment = movement * 20;
            lastFaceY += adjustment;
            lastFaceY = Math.max(0, Math.min(lastFaceY, canvasSize.height));
          }
        } catch (error) {
          console.error('Face detection error:', error);
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
  }, [gameState, canvasSize]);

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
          borderRadius: '10px'
        }}>
          Quantum Score: {score}
        </div>
      )}
  
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px', left: '10px',
          color: 'red',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default App;