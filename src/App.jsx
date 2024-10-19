import { useRef, useEffect, useState } from 'react';
import { initGame, updateGame, startGame } from './gameLogic';
import bgImage from './assets/qubit-game-bg.png';
import "./App.css"

function App() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [error, setError] = useState(null);
  const [isClapping, setIsClapping] = useState(false);
  const [mode, setMode] = useState(null);

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

  const handleGameModeClick = () => {
    setGameState('mode');
  }

  const handleStartClick = async (selectedMode) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    try {
      await initGame(ctx, canvasSize.width, canvasSize.height);
      startGame(canvasSize.width, canvasSize.height);
      setMode(selectedMode);
      setGameState('playing');
      
      if (mode === 'sound') {
        startAudioProcessing();
      } else {
        alert('Oops! You\'ve hit a dead-end. This mode is still under construction.');
        setGameState('mode');
        return;
      }
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
  
      {(gameState === 'start' || gameState === 'gameover' || gameState === 'mode') && (
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
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          gap: 56
        }}>
          <h1 className="game-header">Quantum Flappy Face</h1>
          <button
            onClick={handleGameModeClick}
            className="game-btn"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === 'mode' && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          gap: 56
        }}>
          <h2 className="game-header">Select Mode</h2>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 20
          }}>
            <button
              onClick={() => handleStartClick('sound')}
              className="game-btn quantum-theme"
            >
              Sound Mode
            </button>
            <button
              onClick={() => handleStartClick('smiling')}
              className="game-btn quantum-theme"
            >
              Smiling Mode
            </button>
          </div>
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
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          gap: 24
        }}>
          <h1 className="game-header">Game Over</h1>
          <h2 className="game-subheader">Final Score: {score}</h2>
          <button
            onClick={handleRestart}
            className="game-btn"
          >
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