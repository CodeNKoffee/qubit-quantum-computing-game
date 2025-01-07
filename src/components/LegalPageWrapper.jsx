import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function LegalPageWrapper({ children, bgImage }) {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <img
        src={bgImage}
        className="absolute inset-0 w-full h-full object-cover -z-10"
        alt="Background"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 -z-5" />

      {/* Content */}
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-white hover:text-white/80 mb-8 inline-block">
            ← Back to Game
          </Link>
          <div className="bg-white/95 shadow-xl rounded-lg p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

LegalPageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  bgImage: PropTypes.string.isRequired
};

export default LegalPageWrapper;