import React, { useState } from 'react';
import { CreditCard, QrCode, Smartphone } from 'lucide-react';

const Payment = ({ formData, updateFormData, nextStep, prevStep, currentStep, totalSteps }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const paymentData = {
        amount: formData.event?.price || formData.eventSelection?.amount || 0,
        transactionId: 'TXN' + Date.now(),
        method: paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      // Prepare data for backend
      const registrationData = {
        studentData: formData.studentInfo || formData.studentData,
        eventSelection: formData.event || formData.eventSelection,
        paymentData: paymentData,
        participationType: formData.participationType || 'individual'
      };

      // Call your backend API instead of direct service
      const response = await fetch('http://localhost:5000/api/payment/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();

      if (result.success) {
        // Update form data with payment details
        updateFormData({
          paymentData: paymentData,
          registrationId: result.registrationId
        });
        nextStep(); // Move to next step (OTP verification or success)
      } else {
        alert('Registration failed: ' + result.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error completing registration. Please check your connection and try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Calculate amount with fallbacks
  const amount = formData.event?.price || formData.eventSelection?.amount || 0;
  const eventName = formData.event?.name || formData.eventSelection?.eventName || 'Selected Event';
  const participationType = formData.participationType?.type || formData.participationType || 'Individual';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment</h2>
          <p className="text-gray-600">Step {currentStep} of {totalSteps} - Complete your registration</p>
        </div>
        <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          Step {currentStep}/{totalSteps}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Event:</span>
              <span className="font-semibold text-gray-800">{eventName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Participation Type:</span>
              <span className="font-semibold text-gray-800">{participationType}</span>
            </div>
            {formData.studentInfo && (
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Student:</span>
                  <span className="font-semibold">
                    {formData.studentInfo.name || `${formData.studentInfo.firstName} ${formData.studentInfo.lastName}`}
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total Amount:</span>
              <span className="text-blue-600">₹{amount}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h3>
          <div className="grid grid-cols-1 gap-4 mb-6">
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                paymentMethod === 'upi' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Smartphone className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <span className="font-semibold block">UPI Payment</span>
                  <span className="text-sm text-gray-600">GPay, PhonePe, Paytm</span>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                paymentMethod === 'card' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <span className="font-semibold block">Credit/Debit Card</span>
                  <span className="text-sm text-gray-600">Visa, Mastercard, RuPay</span>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setPaymentMethod('qr')}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                paymentMethod === 'qr' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <QrCode className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <span className="font-semibold block">QR Code</span>
                  <span className="text-sm text-gray-600">Scan and Pay</span>
                </div>
              </div>
            </button>
          </div>

          {/* Payment Instructions */}
          {paymentMethod === 'upi' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">UPI Payment Instructions</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>1. Open your UPI app (GPay, PhonePe, Paytm)</li>
                <li>2. Send payment to: <strong>university@oksbi</strong></li>
                <li>3. Enter amount: <strong>₹{amount}</strong></li>
                <li>4. Complete the transaction in your UPI app</li>
              </ul>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">Card Payment</h4>
              <p className="text-yellow-700 text-sm">You will be redirected to secure payment gateway after clicking "Pay Now".</p>
            </div>
          )}

          {paymentMethod === 'qr' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">QR Code Payment</h4>
              <p className="text-green-700 text-sm">A QR code will be generated for you to scan and pay.</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={prevStep}
          disabled={processing}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
        >
          ← Back
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Total Amount</div>
          <div className="text-2xl font-bold text-blue-600">₹{amount}</div>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold flex items-center min-w-[140px] justify-center"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            `Pay Now`
          )}
        </button>
      </div>
    </div>
  );
};

export default Payment;