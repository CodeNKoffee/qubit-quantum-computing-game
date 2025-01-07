import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Settings, ShoppingBag } from "lucide-react";
import { initGame, updateGame, startGame } from "../gameLogic";
import PropTypes from 'prop-types';

function GameComponent({ bgImage, gameIntroSoundFile }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [error, setError] = useState(null);
  const [isClapping, setIsClapping] = useState(false);
  const [modeDescription, setModeDescription] = useState(null);
  const [musicInitialized, setMusicInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const introMusicRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
      if (introMusicRef.current && !["playing", "gameover"].includes(gameState)) {
        introMusicRef.current.play()
          .catch(error => console.error("Error playing intro music:", error));
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
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    if (["playing", "gameover"].includes(gameState)) {
      pauseIntroMusic();
    } else if (musicInitialized) {
      playIntroMusic();
    }

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      pauseIntroMusic();
    };
  }, [gameState, musicInitialized, gameIntroSoundFile]);

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
      console.error("Microphone access denied:", error);
      setError("Microphone access is required to play the game.");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    let animationFrameId;

    const gameLoop = () => {
      if (gameState === "playing" && !isPaused) {
        const gameStatus = updateGame(ctx, isClapping, canvasSize.width, canvasSize.height);
        if (gameStatus.gameOver) {
          setGameState("gameover");
          cancelAnimationFrame(animationFrameId);
        } else {
          setScore(gameStatus.score);
        }
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (gameState === "playing") {
      gameLoop();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, canvasSize, isClapping, isPaused]);

  const handleStartClick = async (selectedMode) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    try {
      await initGame(ctx, canvasSize.width, canvasSize.height);
      startGame(canvasSize.width, canvasSize.height);
      setGameState("playing");

      if (selectedMode === "sound") {
        startAudioProcessing();
      } else {
        alert("Oops! You've hit a dead-end. This mode is still under construction.");
        setGameState("mode");
      }
    } catch (error) {
      console.error("Failed to start game:", error);
      setError("Failed to start the game. Please try again.");
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />

      {/* Background Image */}
      {(gameState === "start" || gameState === "gameover" || gameState === "mode") && (
        <img
          src={bgImage}
          className="absolute top-0 left-0 w-full h-full -z-10"
          alt="Background"
        />
      )}

      {/* Top Right Icons */}
      {["start", "mode", "playing", "gameover"].includes(gameState) && (
        <div className="absolute top-4 right-4 flex gap-4 z-50">
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <ShoppingBag className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>
          {gameState === "playing" && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <Pause className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Music</span>
                <button
                  onClick={() => setMusicEnabled(!musicEnabled)}
                  className={`px-4 py-2 rounded ${
                    musicEnabled ? "bg-green-500" : "bg-red-500"
                  } text-white`}
                >
                  {musicEnabled ? "On" : "Off"}
                </button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Legal</h3>
                <div className="space-y-2">
                  <Link to="/terms" className="block text-blue-600 hover:underline">
                    Terms of Service
                  </Link>
                  <Link to="/privacy" className="block text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                  <Link to="/refund" className="block text-blue-600 hover:underline">
                    Refund Policy
                  </Link>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Legal Links (Start Screen) */}
      {gameState === "start" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-8 text-white/80 z-50">
          <Link to="/terms" className="hover:text-white">Terms</Link>
          <Link to="/privacy" className="hover:text-white">Privacy</Link>
          <Link to="/refund" className="hover:text-white">Refund</Link>
        </div>
      )}

      {/* Game States UI */}
      {gameState === "start" && (
        <>
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 gap-14">
            <h1 className="game-header">Quantum Fly</h1>
            <button onClick={() => setGameState("mode")} className="game-btn">
              Start Game
            </button>
          </div>
        </>
      )}

      {gameState === "mode" && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 gap-14">
          <h2 className="game-header">Select Mode</h2>
          <div className="flex gap-5">
            <button
              onMouseOver={() => setModeDescription(
                "Use your voice to control the qubit! Clap or make loud noises to move the qubit upward—stay quiet, and watch it fall."
              )}
              onClick={() => handleStartClick("sound")}
              className="game-btn quantum-theme w-56"
            >
              Quantum Pulse
            </button>
            <button
              onMouseOver={() => setModeDescription(
                "Your smile powers the qubit! The bigger your smile, the higher the qubit flies. Frown, and it slowly drifts down."
              )}
              onClick={() => handleStartClick("smiling")}
              className="game-btn quantum-theme w-56"
            >
              Grin Gravity
            </button>
          </div>
          <p className={`font-bold absolute bottom-5 bg-white ${
            modeDescription ? "opacity-75" : "opacity-0"
          } rounded-2xl p-8`}>
            {modeDescription}
          </p>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 gap-6">
          <h1 className="game-header">Game Over</h1>
          <h2 className="game-subheader">Final Score: {score}</h2>
          <button 
            onClick={() => {
              setScore(0);
              setGameState("start");
              setError(null);
            }} 
            className="game-btn"
          >
            Restart Game
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <div className="absolute top-5 left-5 text-white text-2xl font-bold bg-black/50 p-3 rounded-2xl">
          Quantum Score: {score}
        </div>
      )}

      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-2xl font-bold">
          {error}
        </div>
      )}
    </div>
  );
}

GameComponent.propTypes = {
  bgImage: PropTypes.string.isRequired,
  gameIntroSoundFile: PropTypes.string.isRequired
};

export default GameComponent;