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
        transactionData: {
          amount: amount,
          timestamp: new Date().toISOString()
        }
      };
      
      const result = await apiRequest('/api/verify-upi-payment', {
        method: 'POST',
        body: verificationPayload
      });

      console.log('📡 UPI Verification Response:', result);

      if (result && result.success) {
        console.log('✅ UPI verification submitted successfully');
        
        // Create the complete verification data
        const verificationResult = {
          upiTransactionId: formData.upiTransactionId,
          payerName: formData.payerName,
          payerUPI: formData.payerUPI,
          verificationId: result.verificationId,
          originalTransaction: verificationData,
          verificationTimestamp: new Date().toISOString()
        };
        
        setShowVerification(false);
        
        // Call onPaymentSuccess with the verification data
        // This will update the formData and trigger nextStep in PaymentFlow
        if (onPaymentSuccess) {
          onPaymentSuccess(verificationResult);
        }
        
        // Then proceed to next step (which will be the UPI Verification component)
        // But since we already have the verification data, it should auto-submit
        if (nextStep) {
          nextStep();
        }
      } else {
        console.error('❌ UPI verification failed:', result?.error || 'Unknown error');
        alert(`Payment verification failed: ${result?.error || 'Please check your details and try again'}`);
        if (onPaymentFailure) {
          onPaymentFailure(new Error(result?.error || 'Verification failed'));
        }
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      alert(`Error during verification: ${error.message || 'Please try again'}`);
      if (onPaymentFailure) {
        onPaymentFailure(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccessClick = () => {
    // When user clicks "I've Made Payment", just collect the verification data
    // The actual submission happens after they fill the form
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

  // Verification Modal Component - Enhanced
  const VerificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-10 my-4 border-4 border-purple-300 transform animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block bg-purple-600 p-4 sm:p-5 rounded-full mb-3 sm:mb-4 shadow-lg">
            <CheckCircle className="text-white" size={window.innerWidth < 640 ? 32 : 40} />
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-purple-900 mb-2">Verify Payment</h3>
          <p className="text-gray-600 font-semibold text-sm sm:text-base">Enter your transaction details to complete registration</p>
          
          {/* Critical Registration Notice */}
          <div className="mt-4 p-3 sm:p-4 bg-blue-600 border-3 border-blue-700 rounded-xl shadow-lg">
            <p className="text-xs sm:text-sm text-white font-black flex items-start">
              <span className="text-lg sm:text-xl mr-2 flex-shrink-0">🎯</span>
              <span>This step generates your Registration ID. Without submitting this form, your registration will remain incomplete.</span>
            </p>
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          handlePaymentVerification({
            upiTransactionId: formData.get('upiTransactionId'),
            payerName: formData.get('payerName'),
            payerUPI: formData.get('payerUPI')
          });
        }} className="space-y-4 sm:space-y-5">
          {/* UPI Transaction ID */}
          <div>
            <label className="block text-sm sm:text-base font-black text-gray-800 mb-2 sm:mb-3 flex items-center">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm mr-2">1</span>
              UPI Transaction ID *
            </label>
            <input
              type="text"
              name="upiTransactionId"
              required
              placeholder="Enter 12-digit UPI Transaction ID"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border-3 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base font-semibold bg-white shadow-md transition-all text-gray-900"
            />
          </div>

          {/* Payer Name */}
          <div>
            <label className="block text-sm sm:text-base font-black text-gray-800 mb-2 sm:mb-3 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm mr-2">2</span>
              Your Name *
            </label>
            <input
              type="text"
              name="payerName"
              required
              placeholder="Enter your full name"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border-3 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base font-semibold bg-white shadow-md transition-all text-gray-900"
            />
          </div>

          {/* Payer UPI ID */}
          <div>
            <label className="block text-sm sm:text-base font-black text-gray-800 mb-2 sm:mb-3 flex items-center">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm mr-2">3</span>
              Your UPI ID
            </label>
            <input
              type="text"
              name="payerUPI"
              placeholder="yourname@upi (optional)"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border-3 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base font-semibold bg-white shadow-md transition-all text-gray-900"
            />
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-400 border-4 border-yellow-500 rounded-xl p-4 sm:p-5 shadow-lg">
            <p className="text-xs sm:text-base text-gray-900 font-black flex items-start">
              <span className="text-xl sm:text-2xl mr-2 sm:mr-3 flex-shrink-0">⚠️</span>
              <span>
                <strong>Note:</strong> Your registration will be confirmed only after manual verification by our team. This may take up to 24 hours.
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={handleCancelVerification}
              disabled={isProcessing}
              className="flex-1 px-5 sm:px-6 py-3 sm:py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:bg-gray-400 transition-all font-black text-sm sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              ❌ Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-5 sm:px-6 py-3 sm:py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-black text-sm sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent mr-2"></div>
                  Submitting...
                </span>
              ) : (
                '✅ Submit Verification'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Add blink animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-blink {
          animation: blink 1s ease-in-out infinite;
        }
      `}</style>
      
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 min-h-screen">
      {/* Header Section - Compact */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-block mb-2 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Step 4 of 5</span>
        </div>
        
        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-2">
          💳 Complete Your Payment
        </h2>
        <p className="text-sm sm:text-base text-gray-700 font-semibold max-w-2xl mx-auto mb-3">
          Secure UPI payment to confirm your Tech Fest registration
        </p>
        
        {/* Important Registration Note - COMPACT & MOBILE FRIENDLY */}
        <div className="max-w-4xl mx-auto px-2">
          <div className="relative bg-gradient-to-r from-red-600 via-orange-600 to-red-600 border-3 sm:border-4 border-yellow-400 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-5 shadow-2xl animate-pulse">
            {/* Decorative corners - mobile optimized */}
            <div className="absolute -top-1.5 sm:-top-2 -left-1.5 sm:-left-2 bg-yellow-400 text-red-600 font-black text-base sm:text-lg md:text-2xl w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl animate-bounce border border-white sm:border-2">⚠️</div>
            <div className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 bg-yellow-400 text-red-600 font-black text-base sm:text-lg md:text-2xl w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl animate-bounce border border-white sm:border-2">⚠️</div>
            <div className="absolute -bottom-1.5 sm:-bottom-2 -left-1.5 sm:-left-2 bg-yellow-400 text-red-600 font-black text-base sm:text-lg md:text-2xl w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl animate-bounce border border-white sm:border-2" style={{ animationDelay: '0.2s' }}>⚠️</div>
            <div className="absolute -bottom-1.5 sm:-bottom-2 -right-1.5 sm:-right-2 bg-yellow-400 text-red-600 font-black text-base sm:text-lg md:text-2xl w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl animate-bounce border border-white sm:border-2" style={{ animationDelay: '0.2s' }}>⚠️</div>
            
            <div className="bg-white bg-opacity-95 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-5 border-2 sm:border-3 border-yellow-400 shadow-inner">
              <div className="flex items-start justify-center">
                <span className="text-2xl sm:text-3xl md:text-4xl mr-1.5 sm:mr-2 md:mr-3 flex-shrink-0 animate-pulse">🚨</span>
                <div className="text-left flex-1">
                  <h3 className="text-sm sm:text-lg md:text-2xl font-black text-red-600 mb-1.5 sm:mb-2 uppercase tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                    CRITICAL: READ THIS!
                  </h3>
                  <div className="bg-yellow-100 border-2 sm:border-3 border-yellow-500 rounded-md sm:rounded-lg p-1.5 sm:p-2 md:p-3 mb-1.5 sm:mb-2">
                    <p className="text-xs sm:text-sm md:text-lg text-gray-900 font-black leading-tight">
                      🔴 Payment alone does <span className="text-red-600 underline decoration-2 sm:decoration-4">NOT</span> complete registration!
                    </p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs md:text-sm">
                    <p className="text-gray-800 font-bold leading-tight flex items-start">
                      <span className="text-sm sm:text-base mr-0.5 sm:mr-1 flex-shrink-0">1️⃣</span>
                      <span className="flex-1">Make UPI payment • <span className="font-black">2️⃣ Click "Verify Now"</span></span>
                    </p>
                    <p className="text-gray-800 font-bold leading-tight flex items-start">
                      <span className="text-sm sm:text-base mr-0.5 sm:mr-1 flex-shrink-0">3️⃣</span>
                      <span className="flex-1">Submit transaction details to get Registration ID</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Amount Display - Compact */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-xl shadow-xl border-3 border-blue-600 max-w-md mx-auto">
          <div className="text-xs sm:text-sm text-blue-700 mb-1 font-bold flex items-center justify-center">
            <span className="text-lg mr-1">💰</span>
            Total Amount
          </div>
          <div className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ₹{amount}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column - QR Code & UPI Details */}
        <div className="space-y-3 sm:space-y-4">
          {/* Device Indicator - Enhanced */}
          <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-xl shadow-lg border-2 border-gray-200">
            {deviceType === 'mobile' ? (
              <>
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Smartphone className="text-white" size={24} />
                </div>
                <span className="text-base font-black text-gray-800">📱 Mobile Device Detected</span>
              </>
            ) : deviceType === 'tablet' ? (
              <>
                <div className="bg-green-600 p-2 rounded-lg">
                  <Laptop className="text-white" size={24} />
                </div>
                <span className="text-base font-black text-gray-800">📱 Tablet Device Detected</span>
              </>
            ) : (
              <>
                <div className="bg-purple-600 p-2 rounded-lg">
                  <Laptop className="text-white" size={24} />
                </div>
                <span className="text-base font-black text-gray-800">💻 Desktop Device Detected</span>
              </>
            )}
          </div>

          {/* QR Code Section - Compact */}
          <div className="p-4 bg-white rounded-xl shadow-xl border-3 border-purple-300">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-black text-gray-800 flex items-center">
                <div className="bg-purple-600 p-2 rounded-lg mr-3">
                  <QrCode className="text-white" size={24} />
                </div>
                Scan QR Code
              </h4>
              <button
                onClick={downloadQRCode}
                className="flex items-center text-white font-bold space-x-2 px-4 py-2 text-sm bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Download size={18} />
                <span>Download</span>
              </button>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <img 
                  src={generateQRCodeUrl()} 
                  alt="UPI QR Code"
                  className="relative w-52 h-52 sm:w-60 sm:h-60 border-4 border-white rounded-xl shadow-xl"
                  onError={(e) => {
                    console.error('QR code failed to load');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              <div className="text-center space-y-2 w-full">
                {/* UPI ID */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-300 shadow-md">
                  <span className="text-sm font-black text-gray-700">UPI ID:</span>
                  <div className="flex items-center space-x-3">
                    <code className="text-base font-mono bg-white px-4 py-2 rounded-lg text-blue-600 font-black border-2 border-blue-300">{upiId}</code>
                    <button
                      onClick={() => copyToClipboard(upiId, 'upiId')}
                      className="p-2 bg-white hover:bg-blue-50 rounded-lg transition-colors border-2 border-blue-300"
                      title="Copy UPI ID"
                    >
                      {copiedField === 'upiId' ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <Copy size={20} className="text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-300 shadow-md">
                  <span className="text-sm font-black text-gray-700">Amount:</span>
                  <div className="flex items-center space-x-3">
                    <code className="text-base font-mono bg-white px-4 py-2 rounded-lg text-green-600 font-black border-2 border-green-300">₹{amount}</code>
                    <button
                      onClick={() => copyToClipboard(amount.toString(), 'amount')}
                      className="p-2 bg-white hover:bg-green-50 rounded-lg transition-colors border-2 border-green-300"
                      title="Copy Amount"
                    >
                      {copiedField === 'amount' ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <Copy size={20} className="text-green-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Recipient */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 shadow-md">
                  <span className="text-sm font-black text-gray-700">To:</span>
                  <div className="flex items-center space-x-3">
                    <code className="text-sm font-mono bg-white px-4 py-2 rounded-lg text-purple-600 font-black border-2 border-purple-300">{recipientName}</code>
                    <button
                      onClick={() => copyToClipboard(recipientName, 'name')}
                      className="p-2 bg-white hover:bg-purple-50 rounded-lg transition-colors border-2 border-purple-300"
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
        <div className="space-y-3 sm:space-y-4">
          {/* Payment Action Buttons */}
          <div className="space-y-3 sm:space-y-4">
            {deviceType === 'mobile' && (
              <button
                onClick={handleUPIPayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 sm:py-5 px-4 sm:px-8 rounded-xl sm:rounded-2xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-black text-base sm:text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 border-3 sm:border-4 border-purple-700"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-3 border-white border-t-transparent mr-2 sm:mr-3"></div>
                    <span className="text-sm sm:text-base">Opening UPI App...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📱</span>
                    <span className="leading-tight">{`Open UPI App - Pay ₹${amount}`}</span>
                  </span>
                )}
              </button>
            )}

            {/* Payment Verification - Mobile Optimized */}
            <div className="relative p-3 sm:p-4 md:p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl shadow-xl border-3 sm:border-4 border-green-500">
              {/* Attention grabbers */}
              <div className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 bg-yellow-400 text-red-600 font-black text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg transform rotate-12 animate-bounce border border-white sm:border-2">
                CLICK!
              </div>
              
              <div className="text-center mb-2 sm:mb-3">
                <div className="inline-block bg-green-600 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 shadow-lg animate-bounce">
                  <CheckCircle className="text-white" size={24} />
                </div>
                <h4 className="font-black text-green-900 text-base sm:text-lg md:text-2xl mb-1.5 sm:mb-2 uppercase leading-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                  ⚡ Verification Required ⚡
                </h4>
                
                {/* Critical Reminder - Mobile Optimized */}
                <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-red-600 border-2 sm:border-3 border-red-800 rounded-lg sm:rounded-xl shadow-lg">
                  <p className="text-[10px] sm:text-xs md:text-sm text-white font-black flex items-start justify-center">
                    <span className="text-lg sm:text-xl mr-1.5 sm:mr-2 flex-shrink-0 animate-bounce">🔴</span>
                    <span className="text-left leading-tight">Registration ID generated ONLY after verification!</span>
                  </p>
                </div>
                
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-800 font-bold bg-white p-1.5 sm:p-2 rounded-md sm:rounded-lg border border-green-400 sm:border-2">
                  Click below after making payment
                </p>
              </div>
              <button
                onClick={handlePaymentSuccessClick}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white py-4 sm:py-5 px-4 sm:px-6 rounded-xl hover:from-green-700 hover:via-green-600 hover:to-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-black text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 border-3 border-green-800 animate-blink"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-3 border-white border-t-transparent mr-2 sm:mr-3"></div>
                    <span className="text-sm sm:text-base">Verifying...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="text-xl sm:text-2xl mr-2 sm:mr-3">✅</span>
                    <span className="leading-tight">I've Made the Payment - Verify Now</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Instructions - Compact */}
          <div className="p-4 bg-white rounded-xl shadow-lg border-3 border-blue-300">
            <h5 className="font-black text-blue-900 mb-2 flex items-center text-base">
              <div className="bg-blue-600 p-1.5 rounded-lg mr-2">
                <span className="text-white text-sm">ℹ️</span>
              </div>
              Instructions
            </h5>
            <ul className="text-xs sm:text-sm text-gray-700 space-y-1.5">
              {getDeviceInstructions().map((instruction, index) => (
                <li key={index} className="flex items-start p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="bg-blue-600 text-white font-black rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0">{index + 1}</span>
                  <span className="font-semibold">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Section - Compact */}
          <div className="p-4 bg-white rounded-xl shadow-lg border-3 border-yellow-300">
            <h5 className="font-black text-yellow-900 mb-2 text-base flex items-center">
              <span className="text-2xl mr-2">🆘</span>
              Help
            </h5>
            <ul className="text-xs sm:text-sm text-gray-700 space-y-1.5">
              <li className="flex items-start p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-base mr-2">✓</span>
                <span className="font-semibold">UPI app required (GPay, PhonePe, Paytm)</span>
              </li>
              <li className="flex items-start p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-base mr-2">💰</span>
                <span className="font-semibold">Ensure sufficient balance</span>
              </li>
              <li className="flex items-start p-2 bg-red-50 rounded-lg border-2 border-red-300">
                <span className="text-base mr-2">📧</span>
                <span className="font-semibold">Support: <a href="mailto:chaitanyahptu@gmail.com" className="text-blue-600 underline">chaitanyahptu@gmail.com</a></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Compact */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 pt-4 border-t-3 border-gray-300 gap-3">
        <button
          onClick={prevStep}
          className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-black text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          ← Back to Events
        </button>
        
        <div className="text-center bg-yellow-400 px-6 py-3 rounded-lg shadow-lg border-3 border-yellow-500">
          <div className="text-xs text-gray-700 font-black uppercase">Total</div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">₹{amount}</div>
        </div>

        <div className="w-full sm:w-auto sm:w-32"></div>
      </div>

      {/* Copy Success Message - Enhanced */}
      {copiedField && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce border-4 border-green-700 z-50">
          <div className="flex items-center font-black text-base">
            <CheckCircle size={24} className="mr-3" />
            {copiedField === 'upiId' && '✅ UPI ID copied!'}
            {copiedField === 'amount' && '✅ Amount copied!'}
            {copiedField === 'name' && '✅ Name copied!'}
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerification && <VerificationModal />}
    </div>
    </>
  );
};

export default DirectUPIPayment;