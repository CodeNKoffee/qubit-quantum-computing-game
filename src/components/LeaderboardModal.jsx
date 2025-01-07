import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function LeaderboardModal({ onClose, currentScore = null }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('highScore', 'desc'),
          limit(50)
        );
        
        const querySnapshot = await getDocs(q);
        const scoreData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setScores(scoreData);
      } catch (err) {
        console.error('Error fetching scores:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-md rounded-2xl p-8 mx-4 border border-white/20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Quantum Leaderboard</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {currentScore !== null && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-center font-bold">
              Your Score: {currentScore}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-white/60 text-center py-8">Loading scores...</div>
        ) : (
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="text-white/60 text-sm">
                  <th className="py-2 px-4 text-left">Rank</th>
                  <th className="py-2 px-4 text-left">Player</th>
                  <th className="py-2 px-4 text-right">High Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr 
                    key={score.id} 
                    className="text-white border-t border-white/5"
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      {score.photoURL && (
                        <img 
                          src={score.photoURL} 
                          alt="" 
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      {score.displayName || 'Anonymous'}
                    </td>
                    <td className="py-3 px-4 text-right">{score.highScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

LeaderboardModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  currentScore: PropTypes.number
};

export default LeaderboardModal; 