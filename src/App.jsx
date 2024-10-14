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
    initFaceDetection(video);

    let animationFrameId;
    let lastFaceY = canvasSize.height / 2;

    const gameLoop = async () => {
      if (gameState === 'playing') {
        const faceY = await detectFace(video);
        lastFaceY = faceY || lastFaceY;
        const newScore = updateGame(ctx, lastFaceY, canvasSize.width, canvasSize.height);
        setScore(newScore);
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, canvasSize]);

  const handleStartClick = () => {
    setGameState('playing');
    startGame(canvasSize.width, canvasSize.height);
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
      {gameState === 'start' && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0, 0, 0, 0.7)' // Overlay effect 
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
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        color: 'white', 
        fontSize: '24px', 
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' // Text shadow for better visibility 
      }}>
        Quantum Score: {score}
      </div>
    </div>
  );
}

export default App;