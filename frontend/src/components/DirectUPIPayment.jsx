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
          <p className="text-gray-400 font-semibold text-sm sm:text-base">Enter your transaction details to complete registration</p>
          
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
            <label className="block text-sm sm:text-base font-black text-cyan-400 mb-2 sm:mb-3 flex items-center">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm mr-2">1</span>
              UPI Transaction ID *
            </label>
            <input
              type="text"
              name="upiTransactionId"
              required
              placeholder="Enter 12-digit UPI Transaction ID"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border-3 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base font-semibold bg-gray-900/50 shadow-md transition-all text-white"
            />
          </div>

          {/* Payer Name */}
          <div>
            <label className="block text-sm sm:text-base font-black text-cyan-400 mb-2 sm:mb-3 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm mr-2">2</span>
              Your Name *
            </label>
            <input
              type="text"
              name="payerName"
              required
              placeholder="Enter your full name"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border-3 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base font-semibold bg-gray-900/50 shadow-md transition-all text-white"
            />
          </div>

          {/* Payer UPI ID */}
          <div>
            <label className="block text-sm sm:text-base font-black text-cyan-400 mb-2 sm:mb-3 flex items-center">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm mr-2">3</span>
              Your UPI ID
            </label>
            <input
              type="text"
              name="payerUPI"
              placeholder="yourname@upi (optional)"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border-3 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base font-semibold bg-gray-900/50 shadow-md transition-all text-white"
            />
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-400 border-4 border-yellow-500 rounded-xl p-4 sm:p-5 shadow-lg">
            <p className="text-xs sm:text-base text-white font-black flex items-start">
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
      
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
      {/* Header Section - Compact */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-block mb-4 bg-gradient-to-r from-purple-500 via-pink-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg shadow-purple-500/50 border border-purple-400/50">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Step 3 of 4</span>
        </div>
        
        <h2 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 bg-clip-text text-transparent mb-3 animate-pulse">
          💳 Complete Your Payment
        </h2>
        <p className="text-sm sm:text-base text-gray-400 font-semibold max-w-2xl mx-auto mb-3">
          Secure UPI payment to confirm your Tech Fest registration
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto rounded-full"></div>
        
        {/* Important Registration Note - COMPACT & MOBILE FRIENDLY */}
        <div className="max-w-4xl mx-auto px-2">
          <div className="relative bg-gradient-to-r from-red-600 via-orange-600 to-red-600 border-4 border-yellow-400 rounded-2xl p-3 sm:p-4 md:p-6 shadow-2xl shadow-red-500/50 animate-pulse backdrop-blur-xl">
            {/* Decorative corners - mobile optimized */}
            <div className="absolute -top-2 -left-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-red-900 font-black text-base sm:text-lg md:text-2xl w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/50 animate-bounce border-2 border-white">⚠️</div>
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-red-900 font-black text-base sm:text-lg md:text-2xl w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/50 animate-bounce border-2 border-white">⚠️</div>
            <div className="absolute -bottom-2 -left-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-red-900 font-black text-base sm:text-lg md:text-2xl w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/50 animate-bounce border-2 border-white" style={{ animationDelay: '0.2s' }}>⚠️</div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-red-900 font-black text-base sm:text-lg md:text-2xl w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/50 animate-bounce border-2 border-white" style={{ animationDelay: '0.2s' }}>⚠️</div>
            
            <div className="bg-gradient-to-br from-black/90 via-gray-900/95 to-black/90 backdrop-blur-xl rounded-xl p-3 sm:p-4 md:p-6 border-3 border-yellow-400/70 shadow-inner shadow-yellow-500/20">
              <div className="flex items-start justify-center">
                <span className="text-3xl sm:text-4xl md:text-5xl mr-2 sm:mr-3 md:mr-4 flex-shrink-0 animate-pulse">🚨</span>
                <div className="text-left flex-1">
                  <h3 className="text-sm sm:text-lg md:text-2xl font-black bg-gradient-to-r from-red-400 via-orange-500 to-red-400 bg-clip-text text-transparent mb-2 sm:mb-3 uppercase tracking-wider drop-shadow-lg">
                    CRITICAL: READ THIS!
                  </h3>
                  <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-3 border-yellow-400/50 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 backdrop-blur-sm shadow-lg shadow-yellow-500/20">
                    <p className="text-xs sm:text-sm md:text-lg text-yellow-300 font-black leading-tight">
                      🔴 Payment alone does <span className="text-red-400 underline decoration-3 decoration-red-500">NOT</span> complete registration!
                    </p>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base">
                    <p className="text-cyan-300 font-bold leading-tight flex items-start bg-gray-900/40 p-2 rounded-lg border border-cyan-500/30">
                      <span className="text-base sm:text-lg mr-1 sm:mr-2 flex-shrink-0">1️⃣</span>
                      <span className="flex-1">Make UPI payment • <span className="font-black text-yellow-400">2️⃣ Click "Verify Now"</span></span>
                    </p>
                    <p className="text-cyan-300 font-bold leading-tight flex items-start bg-gray-900/40 p-2 rounded-lg border border-cyan-500/30">
                      <span className="text-base sm:text-lg mr-1 sm:mr-2 flex-shrink-0">3️⃣</span>
                      <span className="flex-1">Submit transaction details to get Registration ID</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Amount Display - Compact */}
        <div className="mt-3 sm:mt-4 p-4 sm:p-6 bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black border-2 border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-500/30 max-w-md mx-auto backdrop-blur-xl">
          <div className="text-xs sm:text-sm text-cyan-400 mb-2 font-black flex items-center justify-center uppercase tracking-wider">
            <span className="text-lg mr-2">💰</span>
            Total Payment Amount
          </div>
          <div className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
            ₹{amount}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column - QR Code & UPI Details */}
        <div className="space-y-3 sm:space-y-4">
          {/* Device Indicator - Enhanced */}
          <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-gray-800/80 to-gray-900/90 rounded-xl shadow-lg shadow-cyan-500/20 border-2 border-cyan-500/30 backdrop-blur-sm">
            {deviceType === 'mobile' ? (
              <>
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg shadow-lg shadow-blue-500/50">
                  <Smartphone className="text-white" size={24} />
                </div>
                <span className="text-base font-black text-cyan-400 uppercase tracking-wider">📱 Mobile Device Detected</span>
              </>
            ) : deviceType === 'tablet' ? (
              <>
                <div className="bg-gradient-to-br from-green-500 to-green-700 p-2 rounded-lg shadow-lg shadow-green-500/50">
                  <Laptop className="text-white" size={24} />
                </div>
                <span className="text-base font-black text-cyan-400 uppercase tracking-wider">📱 Tablet Device Detected</span>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-2 rounded-lg shadow-lg shadow-purple-500/50">
                  <Laptop className="text-white" size={24} />
                </div>
                <span className="text-base font-black text-cyan-400 uppercase tracking-wider">💻 Desktop Device Detected</span>
              </>
            )}
          </div>

          {/* QR Code Section - Compact */}
          <div className="p-6 bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-black/95 rounded-2xl shadow-2xl shadow-purple-500/30 border-2 border-purple-500/40 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-black text-cyan-400 flex items-center uppercase tracking-wider">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg mr-3 shadow-lg shadow-purple-500/50">
                  <QrCode className="text-white" size={24} />
                </div>
                Scan QR Code
              </h4>
              <button
                onClick={downloadQRCode}
                className="flex items-center text-white font-black space-x-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 shadow-md border border-cyan-400/50"
              >
                <Download size={18} />
                <span>Download</span>
              </button>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl blur-2xl opacity-60 animate-pulse"></div>
                <img 
                  src={generateQRCodeUrl()} 
                  alt="UPI QR Code"
                  className="relative w-52 h-52 sm:w-60 sm:h-60 border-4 border-cyan-400/50 rounded-2xl shadow-2xl shadow-cyan-500/50"
                  onError={(e) => {
                    console.error('QR code failed to load');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              <div className="text-center space-y-3 w-full">
                {/* UPI ID */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl border-2 border-cyan-500/40 shadow-lg shadow-blue-500/20 backdrop-blur-sm">
                  <span className="text-sm font-black text-cyan-400 uppercase tracking-wider">UPI ID:</span>
                  <div className="flex items-center space-x-3">
                    <code className="text-base font-mono bg-gray-900/70 px-4 py-2 rounded-lg text-white font-black border-2 border-cyan-400/50">{upiId}</code>
                    <button
                      onClick={() => copyToClipboard(upiId, 'upiId')}
                      className="p-2 bg-gray-800/80 hover:bg-cyan-900/40 rounded-lg transition-all transform hover:scale-110 border-2 border-cyan-500/40 shadow-md hover:shadow-cyan-500/50"
                      title="Copy UPI ID"
                    >
                      {copiedField === 'upiId' ? (
                        <CheckCircle size={20} className="text-green-400" />
                      ) : (
                        <Copy size={20} className="text-cyan-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-900/40 to-blue-900/40 rounded-xl border-2 border-green-500/40 shadow-lg shadow-green-500/20 backdrop-blur-sm">
                  <span className="text-sm font-black text-cyan-400 uppercase tracking-wider">Amount:</span>
                  <div className="flex items-center space-x-3">
                    <code className="text-base font-mono bg-gray-900/70 px-4 py-2 rounded-lg text-green-400 font-black border-2 border-green-400/50">₹{amount}</code>
                    <button
                      onClick={() => copyToClipboard(amount.toString(), 'amount')}
                      className="p-2 bg-gray-800/80 hover:bg-green-900/40 rounded-lg transition-all transform hover:scale-110 border-2 border-green-500/40 shadow-md hover:shadow-green-500/50"
                      title="Copy Amount"
                    >
                      {copiedField === 'amount' ? (
                        <CheckCircle size={20} className="text-green-400" />
                      ) : (
                        <Copy size={20} className="text-green-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Recipient */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl border-2 border-purple-500/40 shadow-lg shadow-purple-500/20 backdrop-blur-sm">
                  <span className="text-sm font-black text-cyan-400 uppercase tracking-wider">To:</span>
                  <div className="flex items-center space-x-3">
                    <code className="text-sm font-mono bg-gray-900/70 px-4 py-2 rounded-lg text-purple-400 font-black border-2 border-purple-400/50">{recipientName}</code>
                    <button
                      onClick={() => copyToClipboard(recipientName, 'name')}
                      className="p-2 bg-gray-800/80 hover:bg-purple-900/40 rounded-lg transition-all transform hover:scale-110 border-2 border-purple-500/40 shadow-md hover:shadow-purple-500/50"
                      title="Copy Name"
                    >
                      {copiedField === 'name' ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-purple-400" />
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
                className="w-full bg-gradient-to-r from-purple-500 via-blue-600 to-purple-500 text-white py-4 sm:py-5 px-4 sm:px-8 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 font-black text-base sm:text-lg shadow-xl transform hover:scale-105 border-2 border-purple-400/50"
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
            <div className="relative p-4 sm:p-5 md:p-6 bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl shadow-2xl shadow-green-500/30 border-2 border-green-500/50 backdrop-blur-xl">
              {/* Attention grabbers */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-red-900 font-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-lg transform rotate-12 animate-bounce border-2 border-white">
                CLICK!
              </div>
              
              <div className="text-center mb-3">
                <div className="inline-block bg-gradient-to-br from-green-500 to-green-700 p-3 rounded-full mb-2 shadow-lg shadow-green-500/50 animate-bounce">
                  <CheckCircle className="text-white" size={28} />
                </div>
                <h4 className="font-black text-green-400 text-base sm:text-lg md:text-2xl mb-2 uppercase tracking-wider leading-tight">
                  ⚡ Verification Required ⚡
                </h4>
                
                {/* Critical Reminder - Mobile Optimized */}
                <div className="mb-3 p-3 bg-gradient-to-r from-red-600 to-red-800 border-2 border-red-400 rounded-xl shadow-lg shadow-red-500/30">
                  <p className="text-xs sm:text-sm text-white font-black flex items-start justify-center">
                    <span className="text-xl mr-2 flex-shrink-0 animate-bounce">🔴</span>
                    <span className="text-left leading-tight">Registration ID generated ONLY after verification!</span>
                  </p>
                </div>
                
                <p className="text-xs sm:text-sm text-cyan-400 font-bold bg-gray-900/70 p-2 rounded-lg border-2 border-green-400/50">
                  Click below after making payment
                </p>
              </div>
              <button
                onClick={handlePaymentSuccessClick}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white py-5 px-6 rounded-xl hover:shadow-2xl hover:shadow-green-500/50 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 font-black text-sm sm:text-base md:text-lg shadow-xl transform hover:scale-105 border-2 border-green-400/50 animate-blink"
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
          <div className="p-5 bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-black/95 rounded-2xl shadow-2xl shadow-blue-500/30 border-2 border-blue-500/40 backdrop-blur-xl">
            <h5 className="font-black text-cyan-400 mb-3 flex items-center text-base uppercase tracking-wider">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg mr-3 shadow-lg shadow-blue-500/50">
                <span className="text-white text-sm">ℹ️</span>
              </div>
              Payment Instructions
            </h5>
            <ul className="text-xs sm:text-sm text-gray-300 space-y-2">
              {getDeviceInstructions().map((instruction, index) => (
                <li key={index} className="flex items-start p-3 bg-gray-900/60 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all backdrop-blur-sm">
                  <span className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 flex-shrink-0 shadow-md">{index + 1}</span>
                  <span className="font-semibold text-gray-300">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Section - Compact */}
          <div className="p-5 bg-gradient-to-br from-yellow-900/40 via-orange-900/40 to-red-900/40 rounded-2xl shadow-2xl shadow-yellow-500/30 border-2 border-yellow-500/50 backdrop-blur-xl">
            <h5 className="font-black text-yellow-400 mb-3 text-base flex items-center uppercase tracking-wider">
              <span className="text-3xl mr-3 animate-pulse">🆘</span>
              Need Help?
            </h5>
            <ul className="text-xs sm:text-sm text-gray-300 space-y-2">
              <li className="flex items-start p-3 bg-gray-900/60 rounded-xl border border-green-500/30 hover:border-green-500/50 transition-all backdrop-blur-sm">
                <span className="text-green-400 text-lg mr-3">✓</span>
                <span className="font-semibold text-gray-300">UPI app required (GPay, PhonePe, Paytm)</span>
              </li>
              <li className="flex items-start p-3 bg-gray-900/60 rounded-xl border border-cyan-500/30 hover:border-cyan-500/50 transition-all backdrop-blur-sm">
                <span className="text-cyan-400 text-lg mr-3">💰</span>
                <span className="font-semibold text-gray-300">Ensure sufficient balance</span>
              </li>
              <li className="flex items-start p-3 bg-gradient-to-r from-purple-900/60 to-pink-900/60 rounded-xl border-2 border-purple-500/50 hover:border-purple-400/70 transition-all backdrop-blur-sm shadow-lg shadow-purple-500/20">
                <span className="text-purple-400 text-lg mr-3 animate-pulse">📞</span>
                <div className="font-semibold text-gray-300 flex-1">
                  <div className="mb-1">Contact: <span className="text-cyan-400 font-black">Priyanshu Attri</span></div>
                  <div>Phone: <a href="tel:7018753204" className="text-yellow-400 hover:text-yellow-300 font-black text-base sm:text-lg bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent animate-pulse">7018753204</a></div>
                  <div className="text-[10px] sm:text-xs text-gray-400 mt-1">For any problem, query or issue</div>
                </div>
              </li>
              <li className="flex items-start p-3 bg-gradient-to-r from-red-900/60 to-orange-900/60 rounded-xl border-2 border-red-500/50 hover:border-red-400/70 transition-all backdrop-blur-sm shadow-lg shadow-red-500/20">
                <span className="text-red-400 text-lg mr-3 animate-pulse">📧</span>
                <span className="font-semibold text-gray-300">Email: <a href="mailto:chaitanyahptu@gmail.com" className="text-cyan-400 hover:text-cyan-300 underline decoration-2 font-black">chaitanyahptu@gmail.com</a></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Compact */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 pt-4 border-t-3 border-cyan-500/30 gap-3">
        <button
          onClick={prevStep}
          className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-black text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          ← Back to Events
        </button>
        
        <div className="text-center bg-yellow-400 px-6 py-3 rounded-lg shadow-lg border-3 border-yellow-500">
          <div className="text-xs text-gray-300 font-black uppercase">Total</div>
          <div className="text-2xl sm:text-3xl font-black text-white">₹{amount}</div>
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
