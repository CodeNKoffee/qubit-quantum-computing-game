import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameComponent from './components/GameComponent';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refund from './pages/Refund';
import QuantumShop from './pages/QuantumShop';
import bgImage from './assets/qubit-game-bg.png';
import gameIntroSoundFile from './assets/520937__mrthenoronha__8-bit-game-intro-loop.wav';
import './App.css';
import FirebaseErrorBoundary from './components/FirebaseErrorBoundary';

function App() {
  return (
    <>
      <FirebaseErrorBoundary />
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <GameComponent 
                bgImage={bgImage} 
                gameIntroSoundFile={gameIntroSoundFile}
              />
            } 
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/shop" element={<QuantumShop />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;