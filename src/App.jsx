import { useRef, useEffect, useState } from 'react';
import { initGame, updateGame, startGame } from './gameLogic';
import { initFaceDetection, detectFace } from './faceDetection';

function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });

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
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    initGame(ctx, canvasSize.width, canvasSize.height);

    let animationFrameId;
    let lastFaceY = canvasSize.height / 2;

    const gameLoop = async () => {
      if (gameState === 'playing') {
        try {
          const faceY = await detectFace(video);
          const scaledFaceY = faceY !== null ? (faceY / videoRef.current.videoHeight) * canvasSize.height : lastFaceY;
          lastFaceY = scaledFaceY;
        } catch (error) {
          console.error('Face detection error:', error);
        }
    
        const newScore = updateGame(ctx, lastFaceY, canvasSize.width, canvasSize.height);
    
        if (newScore === null) {
          setGameState('gameover'); // Stop the game on collision
          cancelAnimationFrame(animationFrameId);
        } else {
          setScore(newScore);
        }
      }
    
      if (gameState === 'playing') {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    if (gameState === 'playing') {
      initFaceDetection(video).then(() => {
        gameLoop();
      }).catch(error => {
        console.error('Failed to initialize face detection:', error);
        gameLoop();
      });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, canvasSize]);

  const handleStartClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      
      // Wait for the video to start playing before initializing face detection
      videoRef.current.onloadedmetadata = async () => {
        await initFaceDetection(videoRef.current);
        setGameState('playing');
        startGame(canvasSize.width, canvasSize.height);
      };
    } catch (error) {
      console.error('Camera access denied or error occurred:', error);
      alert('Camera access is required to play the game. The game will start without face detection.');
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

      {/* Start Screen */}
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
            Entangle to Start
          </button>
        </div>
      )}

      {/* Game Over Screen */}
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
          <p style={{ color: 'white', fontSize: '24px', marginBottom: '20px' }}>Your Quantum Score: {score}</p>
          <button 
            onClick={handleRestart} 
            style={{
              fontSize: '20px', 
              padding: '10px 20px', 
              margin: '20px', 
              backgroundColor: 'red', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
            Play Again
          </button>
        </div>
      )}

      {/* Score Display */}
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          color: 'white', 
          fontSize: '24px', 
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
        }}>
          Quantum Score: {score}
        </div>
      )}
    </div>
  );
}

export default App;