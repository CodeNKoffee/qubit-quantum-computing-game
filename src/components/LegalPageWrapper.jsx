import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function LegalPageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← Back to Game
        </Link>
        <div className="bg-white shadow rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

LegalPageWrapper.propTypes = {
  children: PropTypes.node.isRequired
};

export default LegalPageWrapper;