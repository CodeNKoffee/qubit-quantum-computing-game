import { ChevronLeft, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import quantumCoinIcon from '../assets/quantum-currency.png';
import bgImage from '../assets/qubit-game-bg.png';
import charactersImage from '../assets/quantum-characters.jpeg';
import trailsImage from '../assets/quantum-trails.jpeg';
import emotesImage from '../assets/quantum-emotes.jpeg';
import ErrorModal from '../components/ErrorModal';
import { useState } from 'react';

function QuantumShop() {
  const navigate = useNavigate();
  const { isGuest } = useSelector(state => state.user);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const packages = [
    {
      name: "Quantum Starter",
      coins: 1500,
      bonus: 100,
      price: 4.99,
      popular: false,
      description: "Perfect for beginners"
    },
    {
      name: "Quantum Pro",
      coins: 3500,
      bonus: 500,
      price: 9.99,
      popular: true,
      description: "Most popular choice!"
    },
    {
      name: "Quantum Elite",
      coins: 7500,
      bonus: 1500,
      price: 19.99,
      popular: false,
      description: "Best value"
    },
    {
      name: "Quantum Master",
      coins: 16000,
      bonus: 4000,
      price: 39.99,
      popular: false,
      description: "Ultimate package"
    }
  ];

  const handlePurchase = () => {
    if (isGuest) {
      navigate('/');
      return;
    }
    setShowErrorModal(true);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-x-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src={bgImage}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black"></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-lg font-bold">Back to Game</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Quantum Shop</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Quantum Coins Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <img src={quantumCoinIcon} alt="" className="w-8 h-8" />
            Quantum Coins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <div 
                key={pkg.name}
                className={`relative rounded-xl overflow-hidden transform transition-transform hover:scale-105 ${
                  pkg.popular ? 'border-2 border-yellow-500' : 'border border-white/20'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl">
                    POPULAR
                  </div>
                )}
                
                <div className="bg-gradient-to-b from-purple-900/50 to-black p-4 flex flex-col h-full">
                  <h3 className="text-white font-bold mb-2">{pkg.name}</h3>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={quantumCoinIcon} alt="Quantum Coin" className="w-6 h-6" />
                      <span className="text-2xl font-bold text-white">
                        {pkg.coins.toLocaleString()}
                      </span>
                    </div>

                    {pkg.bonus > 0 && (
                      <div className="text-green-400 text-sm mb-2">
                        +{pkg.bonus.toLocaleString()} Bonus
                      </div>
                    )}

                    <div className="text-white/60 text-sm mb-4">
                      {pkg.description}
                    </div>

                    <div className="text-white font-bold mb-4">
                      ${pkg.price}
                    </div>
                  </div>

                  <button 
                    onClick={handlePurchase}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="relative">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-white">Coming Soon</h2>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Character Skins */}
            <div className="relative rounded-xl overflow-hidden border border-white/20 group h-[400px]">
              <img 
                src={charactersImage} 
                alt="Quantum Characters" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div className="relative p-6 h-full flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-2 min-h-[32px]">Quantum Character Skins</h3>
                <p className="text-white/80 mb-4 min-h-[48px]">Transform your qubit with legendary quantum-themed skins</p>
                <div className="absolute top-2 right-2">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm backdrop-blur-sm">Coming Soon</span>
                </div>
              </div>
            </div>

            {/* Particle Effects */}
            <div className="relative rounded-xl overflow-hidden border border-white/20 group h-[400px]">
              <img 
                src={trailsImage} 
                alt="Quantum Trails" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div className="relative p-6 h-full flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-2 min-h-[32px]">Quantum Trails</h3>
                <p className="text-white/80 mb-4 min-h-[48px]">Leave a trail of quantum particles as you fly</p>
                <div className="absolute top-2 right-2">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm backdrop-blur-sm">Coming Soon</span>
                </div>
              </div>
            </div>

            {/* Special Effects */}
            <div className="relative rounded-xl overflow-hidden border border-white/20 group h-[400px]">
              <img 
                src={emotesImage} 
                alt="Quantum Effects" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div className="relative p-6 h-full flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-2 min-h-[32px]">Quantum Effects</h3>
                <p className="text-white/80 mb-4 min-h-[48px]">Special effects and celebrations for your victories</p>
                <div className="absolute top-2 right-2">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm backdrop-blur-sm">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-white/60 text-sm border-t border-white/10 pt-6">
          <p>Quantum Coins can be used to continue gameplay after losing and unlock special features.</p>
          <p className="mt-2">All purchases are final and non-refundable.</p>
          <div className="w-full flex justify-center gap-8 text-white/80 z-40 mt-4">
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/refund" className="hover:text-white">Refund</Link>
          </div>
        </footer>
      </div>

      {showErrorModal && (
        <ErrorModal
          onClose={() => setShowErrorModal(false)}
          message="The shop is currently under maintenance. You'll be able to make purchases soon!"
        />
      )}
    </div>
  );
}

export default QuantumShop; 