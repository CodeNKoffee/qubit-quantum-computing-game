import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function LeaderboardModal({ onClose, currentScore }) {
  const [scores, setScores] = useState([]);
  const [leadingCountry, setLeadingCountry] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('highScore', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const scoresData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setScores(scoresData);

        // Find the leading country
        const countryScores = {};
        scoresData.forEach(score => {
          if (score.country) {
            const countryName = score.country.name;
            if (!countryScores[countryName]) {
              countryScores[countryName] = {
                totalScore: 0,
                count: 0,
                flag: score.country.flag
              };
            }
            countryScores[countryName].totalScore += score.highScore;
            countryScores[countryName].count += 1;
          }
        });

        // Calculate average score per country and find the leader
        let highestAvg = 0;
        let leader = null;
        Object.entries(countryScores).forEach(([country, data]) => {
          const avg = data.totalScore / data.count;
          if (avg > highestAvg) {
            highestAvg = avg;
            leader = { name: country, flag: data.flag };
          }
        });
        setLeadingCountry(leader);
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
  }, [currentScore]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-3xl rounded-2xl p-8 mx-4 border border-white/20">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-3xl font-bold text-white">Global Leaderboard 🏆</h2>
          {leadingCountry && (
            <p className="text-white/80 text-lg">
              <span className="text-2xl">{leadingCountry.flag}</span>{" "}
              {leadingCountry.name} is leading this world cup!
            </p>
          )}
        </div>
        
        {currentScore !== null && (
          <div className="mb-8 p-4 bg-white/5 rounded-lg">
            <p className="text-white text-lg">Your Score: {currentScore}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="py-3 px-4 text-left text-white font-bold">Rank</th>
                <th className="py-3 px-4 text-left text-white font-bold">Player</th>
                <th className="py-3 px-4 text-left text-white font-bold">Country</th>
                <th className="py-3 px-4 text-right text-white font-bold">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {scores.map((score, index) => (
                <tr key={score.id} className="bg-white/5 hover:bg-white/10 transition-colors">
                  <td className="py-3 px-4 text-white/80">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img src={score.photoURL} alt="" className="w-8 h-8 rounded-full" />
                      <span className="text-white">{score.displayName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {score.country ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{score.country.flag}</span>
                        <span className="text-white">{score.country.name}</span>
                      </div>
                    ) : (
                      <span className="text-white/40">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-white font-mono">{score.highScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

LeaderboardModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  currentScore: PropTypes.number
};

export default LeaderboardModal; 