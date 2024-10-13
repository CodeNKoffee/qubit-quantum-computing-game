import { useRef, useEffect, useState } from 'react';
import { initGame, updateGame, startGame } from './gameLogic';
import { initFaceDetection, detectFace } from './faceDetection';

function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    initGame(ctx);
    initFaceDetection(video);

    let animationFrameId;
    let lastFaceY = 300;

    const gameLoop = async () => {
      if (gameState === 'playing') {
        const faceY = await detectFace(video);
        lastFaceY = faceY || lastFaceY;
        const newScore = updateGame(ctx, lastFaceY);
        setScore(newScore);
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  const handleStartClick = () => {
    setGameState('playing');
    startGame();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-4xl font-bold text-white mb-4">Quantum Flappy Face</h1>
      <div className="relative">
        <canvas ref={canvasRef} width={800} height={600} className="border-4 border-blue-500" />
        <video ref={videoRef} className="absolute top-0 right-0 w-1/4 h-1/4" autoPlay playsInline muted />
      </div>
      {gameState === 'start' && (
        <button 
          onClick={handleStartClick} 
          className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg text-xl hover:bg-blue-600 transition-colors"
        >
          Entangle to Start
        </button>
      )}
      <div className="text-white text-2xl mt-4">Quantum Score: {score}</div>
    </div>
  );
}

export default App;