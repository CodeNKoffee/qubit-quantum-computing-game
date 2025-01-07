  import { useRef, useEffect, useState } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import { Pause, Settings, ShoppingBag } from "lucide-react";
  import { initGame, updateGame, startGame } from "../gameLogic";
  import PropTypes from 'prop-types';

  function GameComponent({ bgImage, gameIntroSoundFile }) {
    const navigate = useNavigate();
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
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [countdown, setCountdown] = useState(null);

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
        if (introMusicRef.current && !["playing", "gameover"].includes(gameState) && musicEnabled) {
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
        if (musicEnabled) {
          playIntroMusic();
        }
        window.removeEventListener("mousemove", handleInteraction);
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      };

      window.addEventListener("mousemove", handleInteraction);
      window.addEventListener("click", handleInteraction);
      window.addEventListener("keydown", handleInteraction);

      // Handle music state changes
      if (!musicEnabled) {
        pauseIntroMusic();
      } else if (["playing", "gameover"].includes(gameState)) {
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
    }, [gameState, musicInitialized, gameIntroSoundFile, musicEnabled]);

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

    const handleResume = () => {
      setShowPauseModal(false);
      setCountdown(3);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setIsPaused(false);
            setCountdown(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    };

    return (
      <div className="relative w-screen h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-10"
        />

        {/* Background Image */}
        {(gameState === "start" || gameState === "gameover" || gameState === "mode" || gameState === "playing") && (
          <img
            src={bgImage}
            className="absolute top-0 left-0 w-full h-full -z-10"
            alt="Background"
          />
        )}

        {/* Top Right Icons */}
        {["start", "mode", "playing", "gameover"].includes(gameState) && (
          <div className="absolute top-4 right-4 flex gap-4 z-50">
            <button 
              className={`p-2 ${
                gameState === "playing" 
                  ? "bg-white/10 cursor-not-allowed" 
                  : "bg-white/20 hover:bg-white/30"
              } rounded-full transition-colors`}
              onClick={() => {
                if (gameState !== "playing") {
                  navigate('/shop');
                }
              }}
              disabled={gameState === "playing"}
            >
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
                onClick={() => {
                  setIsPaused(true);
                  setShowPauseModal(true);
                }}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <Pause className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-md rounded-2xl p-8 mx-4 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8">Settings</h2>
              
              <div className="space-y-6">
                {/* Music Setting */}
                <div className="flex items-center justify-between">
                  <span className="text-white text-lg">Music</span>
                  <button
                    onClick={() => setMusicEnabled(!musicEnabled)}
                    className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                      musicEnabled 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "bg-gray-700 hover:bg-gray-600"
                    } text-white`}
                  >
                    {musicEnabled ? "On" : "Off"}
                  </button>
                </div>

                {/* Legal Section */}
                <div className="space-y-3">
                  <h3 className="text-white/80 text-lg font-semibold">Legal</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Link 
                      to="/terms" 
                      className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                    >
                      Terms of Service
                    </Link>
                    <Link 
                      to="/privacy" 
                      className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <Link 
                      to="/refund" 
                      className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                    >
                      Refund Policy
                    </Link>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSettings(false)}
                className="mt-8 w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Pause Modal */}
        {showPauseModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-md rounded-2xl p-8 mx-4 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Game Paused</h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleResume}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Resume Game
                </button>
                
                <button
                  onClick={() => {
                    setShowPauseModal(false);
                    setGameState("start");
                    setIsPaused(false);
                    setScore(0);
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
                >
                  Quit to Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown && (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <div className="text-8xl font-bold text-white animate-pulse drop-shadow-lg">
              {countdown}
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
          <div className="absolute top-5 left-5 text-white text-2xl font-bold bg-black/50 p-3 rounded-2xl z-20">
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