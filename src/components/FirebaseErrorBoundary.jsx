import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const FirebaseErrorBoundary = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, 
      () => setIsLoading(false),
      (error) => {
        console.error('Firebase Auth Error:', error);
        setError(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md p-6 bg-gray-800 rounded-lg shadow-xl text-white">
          <h2 className="text-xl font-bold mb-4">Firebase Configuration Error</h2>
          <div className="text-red-400 mb-4">{error.message}</div>
          <div className="text-sm opacity-75">
            Please check your Firebase configuration and authorized domains.
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FirebaseErrorBoundary;