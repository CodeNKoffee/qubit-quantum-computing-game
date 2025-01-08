import PropTypes from 'prop-types';
import { X, XCircle } from 'lucide-react';

function ErrorModal({ onClose, message }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-md rounded-2xl p-8 mx-4 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">System Message</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 mb-8">
          <XCircle className="w-20 h-20 text-red-500" />
          <p className="text-white/80 text-center text-lg">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

ErrorModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired
};

export default ErrorModal; 