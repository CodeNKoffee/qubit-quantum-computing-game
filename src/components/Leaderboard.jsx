import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Sample data - replace with actual Firebase data fetching
const leaderboardData = [
  {
    id: '1',
    name: 'Quantum Master',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    country: { name: 'United States', flag: '🇺🇸' },
    score: 1250,
  },
  {
    id: '2',
    name: 'Wave Rider',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    country: { name: 'Japan', flag: '🇯🇵' },
    score: 980,
  },
  {
    id: '3',
    name: 'Qubit Queen',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    country: { name: 'Germany', flag: '🇩🇪' },
    score: 875,
  },
  {
    id: '4',
    name: 'Particle Pioneer',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    country: { name: 'United Kingdom', flag: '🇬🇧' },
    score: 750,
  },
  {
    id: '5',
    name: 'Entangled Explorer',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    country: { name: 'Canada', flag: '🇨🇦' },
    score: 620,
  },
];

function Leaderboard() {
  // State for actual leaderboard data
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leaderboard data from Firebase
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, orderBy('score', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const fetchedScores = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setScores(fetchedScores);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard');
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-3xl rounded-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Global Quantum Rankings 🌍
          </h2>

          {loading && (
            <div className="text-white text-center py-8">Loading...</div>
          )}

          {error && (
            <div className="text-red-500 text-center py-8">{error}</div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-12 text-white/60 text-sm px-4">
                <div className="col-span-1">Rank</div>
                <div className="col-span-6">Player</div>
                <div className="col-span-3">Country</div>
                <div className="col-span-2 text-right">Score</div>
              </div>

              {/* Leaderboard Items */}
              <div className="space-y-2">
                {(scores.length > 0 ? scores : leaderboardData).map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-12 items-center p-4 rounded-lg ${
                      index === 0
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : index === 1
                        ? 'bg-gray-400/20 text-gray-400'
                        : index === 2
                        ? 'bg-amber-700/20 text-amber-700'
                        : 'bg-white/5 text-white'
                    }`}
                  >
                    <div className="col-span-1 text-2xl font-bold">
                      {index + 1}
                    </div>
                    <div className="col-span-6 font-bold flex items-center gap-2">
                      <img
                        src={entry.photoURL}
                        alt={entry.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="truncate">{entry.name}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="text-2xl">{entry.country.flag}</span>
                      <span className="truncate">{entry.country.name}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono font-bold">
                      {entry.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;