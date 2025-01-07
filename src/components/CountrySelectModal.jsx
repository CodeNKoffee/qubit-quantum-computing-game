import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import countriesBanner from '../assets/countries-banner.png';
import { countries } from '../../constants';

function CountrySelectModal({ userId, onClose, promptCount = 0 }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countryChanges, setCountryChanges] = useState(0);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        setCountryChanges(userData?.countryChanges || 0);
        setCurrentCountry(userData?.country || null);
        // Don't show welcome if user already has a country
        setShowWelcome(!userData?.country);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleCountrySelect = async () => {
    if (!selectedCountry) return;
    
    if (currentCountry && countryChanges >= 3) {
      setError("You've reached the maximum number of country changes (3).");
      return;
    }
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        country: selectedCountry,
        countryPromptCount: (promptCount + 1),
        ...(currentCountry ? { countryChanges: countryChanges + 1 } : {})
      });
      onClose(selectedCountry);
    } catch (error) {
      console.error('Error updating user country:', error);
      setError('Failed to update country. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome && !currentCountry) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-2xl rounded-2xl overflow-hidden">
          <img 
            src={countriesBanner} 
            alt="Countries Banner" 
            className="w-full h-48 object-cover"
          />
          
          <div className="p-8">
            <h2 className="text-3xl font-bold text-white mb-6">
              Welcome to Quantum Fly! 🌎
            </h2>
            
            <div className="space-y-6 text-white/80">
              <p className="text-lg leading-relaxed">
                Welcome to Quantum Fly - where gaming meets global competition! 🎮
              </p>
              
              <p className="text-lg leading-relaxed">
                This isn&apos;t just another game - it&apos;s a worldwide championship where players from every corner of the globe compete for quantum supremacy in Egypt! 🏆
              </p>
              
              <p className="text-lg leading-relaxed">
                Join thousands of players representing their nations in this epic quest. Your country needs you! 🌟
              </p>
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors"
            >
              Choose Your Country
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-2xl rounded-2xl overflow-hidden">
        <img 
          src={countriesBanner} 
          alt="Countries Banner" 
          className="w-full object-cover"
        />
        
        <div className="p-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            {currentCountry ? 'Change Your Country' : 'Select Your Country'} 🌎
          </h2>
          
          {currentCountry && (
            <div className="mb-4 p-4 bg-white/5 rounded-lg">
              <p className="text-white/80">
                Current Country: <span className="text-2xl">{currentCountry.flag}</span> {currentCountry.name}
              </p>
              <p className="text-white/60 text-sm mt-2">
                Country changes remaining: {Math.max(0, 3 - countryChanges)}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          <p className="text-white/80 mb-8">
            {currentCountry 
              ? "Choose your new country carefully - you can only change it 3 times!"
              : "Choose the country you'll represent in the global quantum championship!"}
          </p>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto custom-scrollbar mb-8">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                disabled={currentCountry && countryChanges >= 3}
                className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  selectedCountry?.code === country.code
                    ? 'bg-blue-600 text-white'
                    : currentCountry && countryChanges >= 3
                    ? 'bg-white/5 text-white/40 cursor-not-allowed'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <span className="text-2xl">{country.flag}</span>
                <span className="text-sm truncate">{country.name}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCountrySelect}
              disabled={!selectedCountry || loading || (currentCountry && countryChanges >= 3)}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                selectedCountry && !(currentCountry && countryChanges >= 3)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {loading ? 'Saving...' : currentCountry ? 'Change Country' : 'Represent Your Country!'}
            </button>
            {(promptCount >= 3 || currentCountry) && (
              <button
                onClick={() => onClose()}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
              >
                {currentCountry ? 'Cancel' : 'Maybe Later'}
              </button>
            )}
          </div>

          {promptCount >= 3 && !currentCountry && (
            <p className="text-white/60 text-sm text-center mt-4">
              You can always select your country using the globe icon at the top of the screen
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

CountrySelectModal.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  promptCount: PropTypes.number
};

export default CountrySelectModal; 