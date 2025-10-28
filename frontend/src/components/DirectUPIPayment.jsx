import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, Laptop, Download, Copy, CheckCircle } from 'lucide-react';
import { apiRequest } from '/src/api/client';

const DirectUPIPayment = ({ amount, onPaymentSuccess, onPaymentFailure, nextStep, prevStep }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [deviceType, setDeviceType] = useState('desktop');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  
  // Your college's UPI ID
  const upiId = '9816367020@axl';
  const recipientName = 'Tech Fest Chaitanya 2025';

  // Detect device type
  useEffect(() => {
    const checkDeviceType = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
      
      if (isMobile) setDeviceType('mobile');
      else if (isTablet) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  const handleUPIPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Generate a unique transaction ID
      const transactionId = `CHAITANYA${Date.now()}`;
      
      // UPI Payment URL structure
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(recipientName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Tech Fest Registration - ${transactionId}`)}`;

      // For mobile devices, try to open UPI apps
      if (deviceType === 'mobile') {
        let appOpened = false;
        const upiApps = [
          { name: 'Google Pay', url: `tez://upi/pay?pa=${upiId}&pn=${recipientName}&am=${amount}&cu=INR` },
          { name: 'PhonePe', url: `phonepe://upi/pay?pa=${upiId}&pn=${recipientName}&am=${amount}&cu=INR` },
          { name: 'Paytm', url: `paytmmp://upi/pay?pa=${upiId}&pn=${recipientName}&am=${amount}&cu=INR` },
          { name: 'Generic UPI', url: upiUrl }
        ];

        for (const app of upiApps) {
          if (!appOpened) {
            try {
              window.location.href = app.url;
              appOpened = true;
              break;
            } catch (error) {
              console.log(`Failed to open ${app.name}`);
              continue;
            }
          }
        }
      }

      // Store transaction details for verification
      const transactionData = {
        id: transactionId,
        amount: amount,
        timestamp: new Date().toISOString(),
        upiId: upiId,
        recipientName: recipientName
      };
      
      localStorage.setItem('lastTransaction', JSON.stringify(transactionData));
      setVerificationData(transactionData);

    } catch (error) {
      console.error('Payment initiation failed:', error);
      onPaymentFailure?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate QR code URL
  const generateQRCodeUrl = () => {
    const qrData = `UPI://pay?pa=${upiId}&pn=${recipientName}&am=${amount}&cu=INR&tn=Tech Fest Chaitanya 2025 Registration`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qrData)}`;
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = generateQRCodeUrl();
    link.download = `TechFest-Payment-₹${amount}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePaymentVerification = async (formData) => {
    setIsProcessing(true);
    
    try {
      console.log('🔐 Submitting UPI verification:', formData);
      
      const verificationPayload = {
        upiTransactionId: formData.upiTransactionId,
        payerName: formData.payerName,
        payerUPI: formData.payerUPI || '',
        transactionData: verificationData
      };
      
const result = await apiRequest('/api/verify-upi-payment', {
  method: 'POST',
  body: verificationPayload
});

      if (result.success) {
        console.log('✅ UPI verification submitted successfully');
        
        const paymentResult = {
          method: 'upi',
          transactionId: result.verificationId,
          amount: amount,
          status: 'pending_verification',
          timestamp: new Date().toISOString(),
          upiId: upiId,
          verificationId: result.verificationId,
          upiTransactionId: formData.upiTransactionId,
          payerName: formData.payerName,
          payerUPI: formData.payerUPI
        };

        onPaymentSuccess?.(paymentResult);
        setShowVerification(false);
      } else {
        console.error('❌ UPI verification failed:', result.error);
        onPaymentFailure?.(new Error(result.error || 'Verification failed'));
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      onPaymentFailure?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccessClick = () => {
    // Load transaction data from localStorage if not already set
    const storedTransaction = localStorage.getItem('lastTransaction');
    if (storedTransaction) {
      setVerificationData(JSON.parse(storedTransaction));
    }
    setShowVerification(true);
  };

  const handleCancelVerification = () => {
    setShowVerification(false);
    setIsProcessing(false);
  };

  // Device-specific instructions
  const getDeviceInstructions = () => {
    switch (deviceType) {
      case 'mobile':
        return [
          '1. Tap "Open UPI App" to launch your payment app',
          '2. Or scan the QR code below with any UPI app',
          '3. Complete the payment in your UPI app',
          '4. Return here and tap "I\'ve Made the Payment"'
        ];
      case 'tablet':
        return [
          '1. Use another device to scan the QR code',
          '2. Or copy UPI details to pay from your phone',
          '3. Complete the payment in your UPI app',
          '4. Return here and tap "I\'ve Made the Payment"'
        ];
      default: // desktop
        return [
          '1. Scan the QR code with your phone\'s UPI app',
          '2. Or copy UPI details to pay from your phone',
          '3. Complete the payment in your UPI app',
          '4. Return here and click "I\'ve Made the Payment"'
        ];
    }
  };

  // Verification Modal Component
  const VerificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 my-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Verify UPI Payment</h3>

        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          handlePaymentVerification({
            upiTransactionId: formData.get('upiTransactionId'),
            payerName: formData.get('payerName'),
            payerUPI: formData.get('payerUPI')
          });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPI Transaction ID *
            </label>
            <input
              type="text"
              name="upiTransactionId"
              required
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
              name="payerName"
              required
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
              name="payerUPI"
              placeholder="yourname@upi (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black placeholder-gray-500"
            />
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your registration will be confirmed only after manual verification by our team. This may take up to 24 hours.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancelVerification}
              disabled={isProcessing}
              className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`px-6 py-3 rounded-lg ${isProcessing ? 'opacity-60 cursor-not-allowed bg-blue-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {isProcessing ? 'Submitting...' : 'Submit Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <div className="text-center mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">Complete Your Payment</h2>
        <p className="text-sm sm:text-base text-gray-600">Pay securely via UPI to confirm your registration</p>
        
        {/* Amount Display */}
        <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-xs sm:text-sm text-blue-700 mb-1 sm:mb-2">Total Amount Payable</div>
          <div className="text-3xl sm:text-4xl font-bold text-blue-600">₹{amount}</div>
          <div className="text-xs sm:text-sm text-blue-600 mt-1 sm:mt-2">Tech Fest Chaitanya 2025 Registration</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Left Column - QR Code & UPI Details */}
        <div className="space-y-4 sm:space-y-6">
          {/* Device Indicator */}
          <div className="flex items-center justify-center space-x-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
            {deviceType === 'mobile' ? (
              <>
                <Smartphone className="text-blue-600" size={20} />
                <span className="text-sm font-medium text-gray-700">Mobile Device Detected</span>
              </>
            ) : deviceType === 'tablet' ? (
              <>
                <Laptop className="text-green-600" size={20} />
                <span className="text-sm font-medium text-gray-700">Tablet Device Detected</span>
              </>
            ) : (
              <>
                <Laptop className="text-purple-600" size={20} />
                <span className="text-sm font-medium text-gray-700">Desktop Device Detected</span>
              </>
            )}
          </div>

          {/* QR Code Section */}
          <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-700 flex items-center">
                <QrCode className="mr-2" size={20} />
                Scan QR Code
              </h4>
              <button
                onClick={downloadQRCode}
                className="flex items-center text-gray-800 space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={16} />
                <span>Download QR</span>
              </button>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <img 
                src={generateQRCodeUrl()} 
                alt="UPI QR Code"
                className="w-64 h-64 border-4 border-white rounded-lg shadow-lg"
                onError={(e) => {
                  console.error('QR code failed to load');
                  e.target.style.display = 'none';
                }}
              />
              
              <div className="text-center space-y-2 w-full">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">UPI ID:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900 font-bold">{upiId}</code>
                    <button
                      onClick={() => copyToClipboard(upiId, 'upiId')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy UPI ID"
                    >
                      {copiedField === 'upiId' ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900 font-bold">₹{amount}</code>
                    <button
                      onClick={() => copyToClipboard(amount.toString(), 'amount')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy Amount"
                    >
                      {copiedField === 'amount' ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Recipient:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900 font-bold">{recipientName}</code>
                    <button
                      onClick={() => copyToClipboard(recipientName, 'name')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy Name"
                    >
                      {copiedField === 'name' ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Instructions */}
        <div className="space-y-6">
          {/* Payment Action Buttons */}
          <div className="space-y-4">
            {deviceType === 'mobile' && (
              <button
                onClick={handleUPIPayment}
                disabled={isProcessing}
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Opening UPI App...
                  </span>
                ) : (
                  `Open UPI App - Pay ₹${amount}`
                )}
              </button>
            )}

            {/* Payment Verification */}
            <div className="p-6 bg-green-50 rounded-xl border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 text-center text-lg">
                Payment Confirmation
              </h4>
              <p className="text-sm text-green-700 mb-4 text-center">
                After making the payment, click below to verify and complete your registration
              </p>
              <button
                onClick={handlePaymentSuccessClick}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </span>
                ) : (
                  "I've Made the Payment - Verify Now"
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-3 flex items-center text-lg">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">
                i
              </span>
              Payment Instructions
            </h5>
            <ul className="text-sm text-blue-700 space-y-3">
              {getDeviceInstructions().map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">{index + 1}.</span>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          {/* Help Section */}
          <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <h5 className="font-semibold text-yellow-800 mb-2 text-lg">Need Help?</h5>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li>• Ensure you have a UPI app installed (Google Pay, PhonePe, Paytm, etc.)</li>
              <li>• Make sure your UPI app has sufficient balance</li>
              <li>• Double-check the UPI ID and amount before paying</li>
              <li>• Contact support if payment fails: chaitanyahptu@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={prevStep}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          ← Back to Events
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total Amount</div>
          <div className="text-2xl font-bold text-blue-600">₹{amount}</div>
        </div>

        <div className="w-32"></div>
      </div>

      {/* Copy Success Message */}
      {copiedField && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
          {copiedField === 'upiId' && 'UPI ID copied!'}
          {copiedField === 'amount' && 'Amount copied!'}
          {copiedField === 'name' && 'Name copied!'}
        </div>
      )}

      {/* Verification Modal */}
      {showVerification && <VerificationModal />}
    </div>
  );
};

export default DirectUPIPayment;