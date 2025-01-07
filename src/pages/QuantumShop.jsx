import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import quantumCoinIcon from '../assets/vbuck.png';
import bgImage from '../assets/qubit-game-bg.png';

function QuantumShop() {
  const navigate = useNavigate();

  const packages = [
    {
      coins: 1000,
      bonus: 0,
      price: 7.99,
      popular: false
    },
    {
      coins: 2800,
      bonus: 300,
      price: 19.99,
      popular: true
    },
    {
      coins: 5000,
      bonus: 700,
      price: 31.99,
      popular: false
    },
    {
      coins: 13500,
      bonus: 2500,
      price: 79.99,
      popular: false
    }
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Image */}
      <img
        src={bgImage}
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
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
                key={pkg.coins}
                className={`relative rounded-xl overflow-hidden ${
                  pkg.popular ? 'border-2 border-yellow-500' : 'border border-white/20'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl">
                    POPULAR
                  </div>
                )}
                
                <div className="bg-gradient-to-b from-purple-900/50 to-black p-4">
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
                    <div className="text-green-400 text-sm mb-4">
                      +{pkg.bonus.toLocaleString()} Bonus
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-white font-bold mb-4">
                    ${pkg.price}
                  </div>

                  {/* Purchase Button */}
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
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
    </div>
  );
}

export default QuantumShop; 