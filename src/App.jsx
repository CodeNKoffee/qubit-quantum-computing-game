import { useRef, useEffect, useState } from 'react';
import { initGame, updateGame, startGame } from './gameLogic';
import bgImage from './assets/qubit-game-bg.png';
import gameIntroSoundFile from './assets/520937__mrthenoronha__8-bit-game-intro-loop.wav';
import "./App.css"

function App() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [error, setError] = useState(null);
  const [isClapping, setIsClapping] = useState(false);
  const [modeDescription, setModeDescription] = useState(null);
  const [musicInitialized, setMusicInitialized] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const introMusicRef = useRef(null);

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
    const initializeAudio = () => {
      if (!musicInitialized) {
        introMusicRef.current = new Audio(gameIntroSoundFile);
        introMusicRef.current.loop = true;
        setMusicInitialized(true);
      }
    };

    const playIntroMusic = () => {
      if (introMusicRef.current && !['playing', 'gameover'].includes(gameState)) {
        introMusicRef.current.play().catch(error => console.error('Error playing intro music:', error));
      }
    };

    const pauseIntroMusic = () => {
      if (introMusicRef.current) {
        introMusicRef.current.pause();
      }
    };

    const handleInteraction = () => {
      initializeAudio();
      playIntroMusic();
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    if (['playing', 'gameover'].includes(gameState)) {
      pauseIntroMusic();
    } else if (musicInitialized) {
      playIntroMusic();
    }

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      pauseIntroMusic();
    };
  }, [gameState, musicInitialized]);

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

  const handleModeInspection = (selectedModeDescription) => {
    if (selectedModeDescription === 'sound') {
      setModeDescription('Use your voice to control the qubit! Clap or make loud noises to move the qubit upward—stay quiet, and watch it fall.');
    } else if (selectedModeDescription === 'smiling') {
      setModeDescription('Your smile powers the qubit! The bigger your smile, the higher the qubit flies. Frown, and it slowly drifts down.');
    }
  }

  const handleStartClick = async (selectedMode) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    try {
      await initGame(ctx, canvasSize.width, canvasSize.height);
      startGame(canvasSize.width, canvasSize.height);
      setGameState('playing');
      
      if (selectedMode === 'sound') {
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
            gap: 20,
          }}>
            <button
              onMouseOver={() => handleModeInspection('sound')}
              onClick={() => handleStartClick('sound')}
              className="game-btn quantum-theme w-56"
              title="Use your voice to control the qubit! Clap or make loud noises to move the qubit upward—stay quiet, and watch it fall."
            >
              Quantum Pulse
            </button>

            <button
              onMouseOver={() => handleModeInspection('smiling')}
              onClick={() => handleStartClick('smiling')}
              className="game-btn quantum-theme w-56"
              title="Your smile powers the qubit! The bigger your smile, the higher the qubit flies. Frown, and it slowly drifts down."
            >
              Grin Gravity
            </button>
          </div>
          <p className={`font-bold absolute bottom-5 bg-white ${modeDescription ? "opacity-75" : "opacity-0"} rounded-2xl p-8`}>{modeDescription}</p>
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