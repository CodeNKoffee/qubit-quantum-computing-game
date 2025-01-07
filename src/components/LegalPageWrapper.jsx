import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function LegalPageWrapper({ children, bgImage, title }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Image */}
      {bgImage && (
        <img
          src={bgImage}
          className="absolute top-0 left-0 w-full h-full -z-10"
          alt="Background"
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-white hover:text-white/80 mb-8 inline-block">
            ← Back to Game
          </Link>
          <div className="bg-white/95 shadow-xl rounded-lg p-8">
            <h1 className="text-3xl font-bold mb-6">{title}</h1>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

LegalPageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  bgImage: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default LegalPageWrapper;