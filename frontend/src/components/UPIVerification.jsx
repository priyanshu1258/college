// components/UPIVerification.jsx
import React, { useState } from 'react';

const UPIVerification = ({ transactionData, onVerificationSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    upiTransactionId: '',
    screenshot: null,
    payerName: '',
    payerUPI: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    
    const verificationData = {
      ...formData,
      originalTransaction: transactionData,
      verificationTimestamp: new Date().toISOString()
    };
    onVerificationSubmit(verificationData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white text-black rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Verify UPI Payment</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPI Transaction ID *
            </label>
            <input
              type="text"
              required
              value={formData.upiTransactionId}
              onChange={(e) => setFormData(prev => ({ ...prev, upiTransactionId: e.target.value }))}
              placeholder="Enter UPI reference number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={formData.payerName}
              onChange={(e) => setFormData(prev => ({ ...prev, payerName: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your UPI ID
            </label>
            <input
              type="text"
              value={formData.payerUPI}
              onChange={(e) => setFormData(prev => ({ ...prev, payerUPI: e.target.value }))}
              placeholder="yourname@upi (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Screenshot (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black file:text-black"
            />
            <p className="text-xs text-gray-600 mt-1">
              Upload screenshot of payment confirmation from your UPI app
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your registration will be confirmed only after manual verification by our team. This may take up to 24 hours.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg ${isSubmitting ? 'opacity-60 cursor-not-allowed bg-blue-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UPIVerification;