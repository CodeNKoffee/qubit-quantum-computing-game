import { useRef, useEffect, useState } from 'react';
import { initGame, updateGame, startGame } from './gameLogic';
import bgImage from './assets/qubit-game-bg.png';

function App() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [error, setError] = useState(null);
  const [isClapping, setIsClapping] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const startAudioProcessing = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      microphoneRef.current.connect(analyserRef.current);

      const detectClap = () => {
        analyserRef.current.getByteTimeDomainData(dataArray);
        let maxVolume = Math.max(...dataArray);
        setIsClapping(maxVolume > 150);
        requestAnimationFrame(detectClap);
      };

      detectClap();
    } catch (error) {
      console.error('Microphone access denied:', error);
      setError('Microphone access is required to play the game.');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    let animationFrameId;

    const gameLoop = () => {
      if (gameState === 'playing') {
        const gameStatus = updateGame(ctx, isClapping, canvasSize.width, canvasSize.height);
        
        if (gameStatus.gameOver) {
          setGameState('gameover');
          cancelAnimationFrame(animationFrameId);
        } else {
          setScore(gameStatus.score);
        }
      }
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      gameLoop();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, canvasSize, isClapping]);

  const handleStartClick = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    try {
      await initGame(ctx, canvasSize.width, canvasSize.height);
      startGame(canvasSize.width, canvasSize.height);
      setGameState('playing');
      startAudioProcessing();
    } catch (error) {
      console.error('Failed to start game:', error);
      setError('Failed to start the game. Please try again.');
    }
  };

  const handleRestart = () => {
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