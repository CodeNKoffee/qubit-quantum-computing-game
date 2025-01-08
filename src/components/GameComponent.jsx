import { useRef, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pause, Settings, ShoppingBag, Trophy, UserCircle, LogOut, Globe } from "lucide-react";
import { initGame, updateGame, startGame } from "../gameLogic";
import PropTypes from 'prop-types';
import AuthModal from "./AuthModal";
import LeaderboardModal from "./LeaderboardModal";
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setGuest, signOut } from '../store/userSlice';
import { setMusicEnabled } from '../store/settingsSlice';
import { getAuth, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CountrySelectModal from "./CountrySelectModal";

function GameComponent({ bgImage, gameIntroSoundFile }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isGuest } = useSelector(state => state.user);
  const { musicEnabled } = useSelector(state => state.settings);
  
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    
    if (isMobile) {
      // For mobile, use full width and 80% of height
      return {
        width: window.innerWidth,
        height: window.innerHeight * 0.8
      };
    } else if (isTablet) {
      // For tablets, use 90% of width and height
      return {
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.9
      };
    } else {
      // For desktop, use full dimensions
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
  });
  const [error, setError] = useState(null);
  const [isClapping, setIsClapping] = useState(false);
  const [modeDescription, setModeDescription] = useState(null);
  const [musicInitialized, setMusicInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const [countryPromptCount, setCountryPromptCount] = useState(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const introMusicRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
      
      if (isMobile) {
        setCanvasSize({
          width: window.innerWidth,
          height: window.innerHeight * 0.8
        });
      } else if (isTablet) {
        setCanvasSize({
          width: window.innerWidth * 0.9,
          height: window.innerHeight * 0.9
        });
      } else {
        setCanvasSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
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

  const handleGameOver = useCallback(() => {
    setGameState("gameover");
    setShowLeaderboard(true);
    
    if (user && !user.country && countryPromptCount < 3) {
      const timer = setTimeout(() => {
        setShowCountrySelect(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, countryPromptCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    let animationFrameId;

    const gameLoop = () => {
      if (gameState === "playing" && !isPaused) {
        const gameStatus = updateGame(ctx, isClapping, canvasSize.width, canvasSize.height, musicEnabled);
        if (gameStatus.gameOver) {
          handleGameOver();
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
  }, [gameState, canvasSize, isClapping, isPaused, handleGameOver, musicEnabled]);

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

  const handleStartGameClick = () => {
    if (!user && !isGuest) {
      setShowAuthModal(true);
    } else {
      setGameState("mode");
    }
  };

  const handleAuthSuccess = async (userData) => {
    // Check if user has a country
    const userDoc = await getDoc(doc(db, 'users', userData.uid));
    const userDocData = userDoc.data();
    const userCountry = userDocData?.country;
    const promptCount = userDocData?.countryPromptCount || 0;
    
    // Update userData with country if it exists
    const updatedUserData = {
      ...userData,
      country: userCountry || null
    };
    
    dispatch(setUser(updatedUserData));
    setShowAuthModal(false);
    
    if (!userCountry && promptCount < 3) {
      setCountryPromptCount(promptCount);
      setShowCountrySelect(true);
    } else {
      setGameState("mode");
    }
  };

  const handleGuestPlay = () => {
    dispatch(setGuest(true));
    setShowAuthModal(false);
    setGameState("mode");
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await firebaseSignOut(auth);
      dispatch(signOut());
      setGameState("start");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update high score when game ends
  useEffect(() => {
    const updateHighScore = async () => {
      if (gameState === "gameover" && user && score > 0) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          const currentHighScore = userDoc.data()?.highScore || 0;
          
          // Only update if new score is higher than current high score
          if (score > currentHighScore) {
            await updateDoc(userRef, {
              highScore: score
            });
            // Update local user state with new high score
            dispatch(setUser({ ...user, highScore: score }));
          }
        } catch (error) {
          console.error('Error updating high score:', error);
        }
      }
    };

    updateHighScore();
  }, [gameState, user, score, dispatch]);

  // Add this effect to handle game speed
  useEffect(() => {
    if (gameState === "playing") {
      // Set a consistent game speed
      const gameSpeed = 2; // Adjust this value to change game speed (1 = normal, 2 = faster, 0.5 = slower)
      startGame(canvasSize.width, canvasSize.height, gameSpeed);
    }
  }, [gameState, canvasSize]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-20"
        style={{
          touchAction: 'none', // Prevent default touch behaviors
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      />

      {/* Background Image */}
      {(gameState === "start" || gameState === "gameover" || gameState === "mode" || gameState === "playing") && (
        <img
          src={bgImage}
          className="absolute top-0 left-0 w-full h-full object-cover -z-10"
          alt="Background"
        />
      )}

      {/* Top Right Icons - Updated for mobile */}
      {["start", "mode", "playing", "gameover"].includes(gameState) && (
        <div className="absolute top-4 inset-x-0 flex flex-wrap items-center justify-center sm:justify-end sm:right-4 sm:inset-x-auto gap-3 z-40 px-2">
          {/* User Profile and Country Indicator */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-white/20 rounded-full px-3 py-2">
                <img 
                  src={user.photoURL} 
                  alt="" 
                  className="w-8 h-8 rounded-full hidden sm:block"
                />
                {user.country ? (
                  <button
                    onClick={() => setShowCountrySelect(true)}
                    className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    title="Change your country"
                  >
                    <span className="text-2xl">{user.country.flag}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCountrySelect(true)}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    title="Select your country"
                  >
                    <Globe className="w-5 h-5 text-white" />
                  </button>
                )}
                <span className="text-white text-sm hidden sm:inline">
                  {user.displayName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <LogOut className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : (
              isGuest ? (
                <div className="flex items-center gap-3 bg-white/20 rounded-full px-3 py-2">
                  <UserCircle className="w-8 h-8 text-white hidden sm:block" />
                  <span className="text-white text-sm hidden sm:inline">
                    Guest
                  </span>
                  <button
                    onClick={() => dispatch(setGuest(false))}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-3 bg-white/20 rounded-full px-3 py-2 hover:bg-white/30 transition-colors"
                >
                  <UserCircle className="w-8 h-8 text-white" />
                  <span className="text-white text-sm hidden sm:inline">
                    Sign In
                  </span>
                </button>
              )
            )}
          </div>

          <div className="flex gap-3">
            <button 
              className={`p-2 aspect-square ${
                gameState === "playing" 
                  ? "bg-white/10 cursor-not-allowed" 
                  : "bg-white/20 hover:bg-white/30"
              } rounded-full transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]`}
              onClick={() => {
                if (gameState !== "playing") {
                  if (!user && !isGuest) {
                    setShowAuthModal(true);
                  } else {
                    navigate('/shop');
                  }
                }
              }}
              disabled={gameState === "playing"}
            >
              <ShoppingBag className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-2 aspect-square bg-white/20 rounded-full hover:bg-white/30 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            >
              <Trophy className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 aspect-square bg-white/20 rounded-full hover:bg-white/30 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>

            {gameState === "playing" && (
              <button
                onClick={() => {
                  setIsPaused(true);
                  setShowPauseModal(true);
                }}
                className="p-2 aspect-square bg-white/20 rounded-full hover:bg-white/30 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
              >
                <Pause className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal - Updated */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-md rounded-2xl p-8 mx-4 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-8">Settings</h2>
            
            <div className="space-y-6">
              {/* Music Setting */}
              <div className="flex items-center justify-between">
                <span className="text-white text-lg">Music</span>
                <button
                  onClick={() => dispatch(setMusicEnabled(!musicEnabled))}
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
      {showPauseModal && !countdown && (
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
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-[2px]">
          <div className="text-[200px] font-bold text-white animate-bounce drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            {countdown}
          </div>
        </div>
      )}

      {/* Legal Links - Increase z-index */}
      {gameState === "start" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-8 text-white/80 z-40">
          <Link to="/terms" className="hover:text-white">Terms</Link>
          <Link to="/privacy" className="hover:text-white">Privacy</Link>
          <Link to="/refund" className="hover:text-white">Refund</Link>
        </div>
      )}

      {/* Game States UI - Updated for mobile */}
      {gameState === "start" && (
        <>
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 gap-8 sm:gap-14 z-30 px-4">
            <h1 className="game-header text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-center">Quantum Fly</h1>
            <button onClick={handleStartGameClick} className="game-btn text-xl sm:text-2xl px-8 py-4 min-w-[200px] whitespace-nowrap">
              Start Game
            </button>
          </div>
        </>
      )}

      {gameState === "mode" && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 gap-8 sm:gap-14 z-30 px-4">
          <h2 className="game-header text-4xl sm:text-6xl md:text-7xl text-center">Select Mode</h2>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full max-w-xl px-4">
            <button
              onMouseOver={() => setModeDescription(
                "Use your voice to control the qubit! Clap or make loud noises to move the qubit upward—stay quiet, and watch it fall."
              )}
              onClick={() => handleStartClick("sound")}
              className="game-btn quantum-theme text-xl px-8 py-4 w-full whitespace-nowrap"
            >
              Quantum Pulse
            </button>
            <button
              onMouseOver={() => setModeDescription(
                "Your smile powers the qubit! The bigger your smile, the higher the qubit flies. Frown, and it slowly drifts down."
              )}
              onClick={() => handleStartClick("smiling")}
              className="game-btn quantum-theme text-xl px-8 py-4 w-full whitespace-nowrap"
            >
              Grin Gravity
            </button>
          </div>
          <p className={`font-bold absolute bottom-5 bg-white ${
            modeDescription ? "opacity-75" : "opacity-0"
          } rounded-2xl p-4 sm:p-8 z-30 mx-4 text-base max-w-2xl text-center`}>
            {modeDescription}
          </p>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 gap-4 sm:gap-6 z-30 px-4">
          <h1 className="game-header text-4xl sm:text-6xl md:text-7xl text-center">Game Over</h1>
          <h2 className="game-subheader text-xl sm:text-2xl">Final Score: {score}</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl px-4">
            <button 
              onClick={() => {
                setScore(0);
                setGameState("start");
                setError(null);
              }} 
              className="game-btn text-xl px-8 py-4 w-full whitespace-nowrap"
            >
              Play Again
            </button>
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="game-btn quantum-theme text-xl px-8 py-4 w-full whitespace-nowrap"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className="absolute top-5 left-5 text-white text-xl sm:text-2xl font-bold bg-black/50 p-2 sm:p-3 rounded-2xl z-30">
          Quantum Score: {score}
        </div>
      )}

      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-xl sm:text-2xl font-bold z-30 text-center px-4">
          {error}
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          onGuestPlay={handleGuestPlay}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal 
          onClose={() => setShowLeaderboard(false)}
          currentScore={gameState === "gameover" ? score : null}
        />
      )}

      {showCountrySelect && user && (
        <CountrySelectModal
          userId={user.uid}
          promptCount={countryPromptCount}
          onClose={(selectedCountry) => {
            setShowCountrySelect(false);
            if (selectedCountry) {
              dispatch(setUser({ ...user, country: selectedCountry }));
            }
            setGameState("mode");
          }}
        />
      )}
    </div>
  );
}

GameComponent.propTypes = {
  bgImage: PropTypes.string.isRequired,
  gameIntroSoundFile: PropTypes.string.isRequired
};

export default GameComponent;