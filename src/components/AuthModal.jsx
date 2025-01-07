import { signInWithPopup, getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, googleProvider } from '../firebase';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import GoogleIcon from '../assets/google-icon.png';
import { useState } from 'react';

function AuthModal({ onClose, onSuccess, onGuestPlay }) {
  const auth = getAuth();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log("Sign-in successful:", user.email); // Debug log
      
      try {
        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.log("Creating new user document"); // Debug log
          
          // Create new user document with minimal data first
          const userData = {
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            quantumCoins: 0,
            highScore: 0
          };

          await setDoc(userDocRef, userData);
          console.log("User document created successfully");
        }
        
        onSuccess(user);
      } catch (dbError) {
        console.error('Database error:', dbError);
        setError('Failed to create user profile. Please try again.');
        // Still allow the user to proceed even if profile creation fails
        onSuccess(user);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'auth/popup-blocked') {
        setError('Please allow popups for this website to sign in with Google.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google Sign-In. Please contact the administrator.');
      } else if (error.code === 'auth/internal-error') {
        setError('Firebase encountered an internal error. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled. Please contact the administrator.');
      } else if (error.code === 'auth/permission-denied') {
        setError('Permission denied. Please try again or contact support.');
      } else {
        setError(`Error: ${error.message || 'An error occurred during sign in. Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-md rounded-2xl p-8 mx-4 border border-white/20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Welcome to Quantum Fly</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <img src={GoogleIcon} alt="Google" className="w-6 h-6" />
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-b from-gray-900 to-black text-white/60">or</span>
            </div>
          </div>

          <button
            onClick={onGuestPlay}
            disabled={isLoading}
            className={`w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-lg transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Play as Guest
          </button>

          <p className="text-white/60 text-sm text-center">
            Guest players cannot:
            <br />
            • Purchase Quantum Coins
            <br />
            • Appear on Global Leaderboards
            <br />
            • Save their progress
          </p>
        </div>
      </div>
    </div>
  );
}

AuthModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onGuestPlay: PropTypes.func.isRequired
};

export default AuthModal; 