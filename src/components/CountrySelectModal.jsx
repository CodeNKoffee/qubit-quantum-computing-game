import { useState } from 'react';
import PropTypes from 'prop-types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import countriesBanner from '../assets/countries-banner.png';

// List of countries with their flags
const countries = [
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' }
].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

function CountrySelectModal({ userId, onClose, promptCount = 0 }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCountrySelect = async () => {
    if (!selectedCountry) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        country: selectedCountry,
        countryPromptCount: (promptCount + 1)
      });
      onClose(selectedCountry);
    } catch (error) {
      console.error('Error updating user country:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-2xl rounded-2xl overflow-hidden">
        {/* Banner Image */}
        <img 
          src={countriesBanner} 
          alt="Countries Banner" 
          className="w-full object-cover"
        />
        
        <div className="p-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Global Quantum Championship! 🌎
          </h2>
          
          <p className="text-white/80 mb-8">
            Quantum Fly is more than just a game - it&apos;s a worldwide competition where players 
            represent their nations in the quest for quantum supremacy! Choose your country 
            and join thousands of players competing for global recognition.
          </p>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto custom-scrollbar mb-8">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  selectedCountry?.code === country.code
                    ? 'bg-blue-600 text-white'
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
              disabled={!selectedCountry || loading}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                selectedCountry
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {loading ? 'Saving...' : 'Represent Your Country!'}
            </button>
            {promptCount >= 3 && (
              <button
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
              >
                Maybe Later
              </button>
            )}
          </div>

          {promptCount >= 3 && (
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