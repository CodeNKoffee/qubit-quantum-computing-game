import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import quantumCoinIcon from '../assets/quantum-currency.png';
import bgImage from '../assets/qubit-game-bg.png';
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
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Image */}
      <img
        src={bgImage}
        className="absolute top-0 left-0 w-full h-full -z-10"
        alt="Background"
      />

      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-4xl rounded-2xl p-6 relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Quantum Coins</h2>
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <div 
                key={pkg.name}
                className={`relative rounded-xl overflow-hidden ${
                  pkg.popular ? 'border-2 border-yellow-500' : 'border border-white/20'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl">
                    POPULAR
                  </div>
                )}
                
                <div className="bg-gradient-to-b from-purple-900/50 to-black p-4 flex flex-col h-full">
                  {/* Package Name */}
                  <h3 className="text-white font-bold mb-2">{pkg.name}</h3>
                  
                  {/* Content Container */}
                  <div className="flex-grow">
                    {/* Coin Amount */}
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={quantumCoinIcon} 
                        alt="Quantum Coin" 
                        className="w-6 h-6"
                      />
                      <span className="text-2xl font-bold text-white">
                        {pkg.coins.toLocaleString()}
                      </span>
                    </div>

                    {/* Bonus */}
                    {pkg.bonus > 0 && (
                      <div className="text-green-400 text-sm mb-2">
                        +{pkg.bonus.toLocaleString()} Bonus
                      </div>
                    )}

                    {/* Description */}
                    <div className="text-white/60 text-sm mb-4">
                      {pkg.description}
                    </div>

                    {/* Price */}
                    <div className="text-white font-bold mb-4">
                      ${pkg.price}
                    </div>
                  </div>

                  {/* Purchase Button */}
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

          {/* Footer */}
          <div className="mt-8 text-center text-white/60 text-sm">
            <p>Quantum Coins can be used to continue gameplay after losing and unlock special features.</p>
            <p className="mt-2">All purchases are final and non-refundable.</p>
          </div>
        </div>
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