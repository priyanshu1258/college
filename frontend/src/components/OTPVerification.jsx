import React, { useState, useEffect, useRef } from 'react';
import { Mail, Clock, RotateCcw, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const OTPVerification = ({ formData, updateFormData, nextStep, prevStep, currentStep, totalSteps }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  // FIXED: Get email from the correct location
  const getEmail = () => {
    return formData.studentDetails?.email || 
           formData.email || 
           formData.studentInfo?.email || 
           formData.studentData?.email ||
           (formData.studentDetails && formData.studentDetails.email) ||
           'test@example.com';
  };

  const sendOTP = async () => {
    setLoading(true);
    setMessage('');
    try {
      const email = getEmail();
      
      console.log('🔍 Looking for email in formData:', formData);
      console.log('📧 Found email:', email);
      
      if (!email || email === 'test@example.com') {
        setMessage('❌ No email found. Please go back and enter your details.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log("✅ OTP sent successfully");

        if (result.developmentOTP) {
          setGeneratedOTP(result.developmentOTP);
        } else {
          const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOTP(testOTP);
        }

        setTimer(60);
      } else {
        setMessage(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(testOTP);
      setMessage(`⚠️ Using test OTP: ${testOTP} (Backend connection failed)`);
      setTimer(60);
    }
    setLoading(false);
  };

  // Auto-send OTP when component mounts
  useEffect(() => {
    sendOTP();
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setMessage('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const email = getEmail();
      
      if (!email || email === 'test@example.com') {
        setMessage('No email found. Please go back and enter your details.');
        setLoading(false);
        return;
      }

      console.log('🔐 Verifying OTP:', { email, otp: otpString });

      if (process.env.NODE_ENV === 'development' && generatedOTP && otpString === generatedOTP) {
        console.log('✅ Development OTP verified successfully');
        updateFormData({ 
          verified: true,
          otpVerified: true,
          ...formData
        });
        nextStep();
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp: otpString 
        })
      });

      const result = await response.json();
      console.log('📨 Backend OTP response:', result);

      if (result.success) {
        console.log("✅ OTP verified successfully");
        updateFormData({ 
          verified: true,
          otpVerified: true,
          ...formData
        });
        nextStep();
      } else {
        setMessage(result.error || result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      if (process.env.NODE_ENV === 'development' && generatedOTP && otpString === generatedOTP) {
        console.log('✅ Fallback OTP verification successful');
        updateFormData({ 
          verified: true,
          otpVerified: true,
          ...formData
        });
        nextStep();
      } else {
        setMessage('Verification failed. Please try again.');
      }
    }
    setLoading(false);
  };

  const userEmail = getEmail() || 'your email';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-md mx-auto">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevStep}
            disabled={loading}
            className="flex items-center text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Step {currentStep}/{totalSteps}
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Verify Your Email</h2>
          
          <p className="text-gray-600 text-sm mb-3">
            We've sent a 6-digit OTP to
          </p>
          <p className="font-semibold text-gray-800 text-base break-all px-4">{userEmail}</p>
          <p className="text-xs text-gray-500 mt-2">
            The OTP will expire in 10 minutes
          </p>
        </div>

        {/* Development OTP Display - Mobile Optimized */}
       

        {/* OTP Input - Mobile Optimized */}
        <div className="flex justify-center space-x-2 mb-6 px-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-gray-900 bg-white flex-1 max-w-[50px]"
              disabled={loading}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          ))}
        </div>

        {/* Timer/Resend Section */}
        <div className="text-center mb-6">
          {timer > 0 ? (
            <div className="flex items-center justify-center text-gray-600 text-sm">
              <Clock className="w-4 h-4 mr-2" />
              Resend OTP in {timer}s
            </div>
          ) : (
            <button
              onClick={sendOTP}
              disabled={loading}
              className="flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors mx-auto text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resend OTP
            </button>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`text-center mb-6 p-3 rounded-lg text-sm ${
            message.includes('successfully') || message.includes('test OTP') || message.includes('✅')
              ? 'bg-green-100 text-green-700' 
              : message.includes('❌') || message.includes('Invalid') || message.includes('Failed')
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {message}
          </div>
        )}

        {/* Verify Button - Mobile Optimized */}
        <button
          onClick={verifyOTP}
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold text-base mb-4 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>

        {/* Help Section - Mobile Optimized */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 text-sm">Didn't receive the OTP?</h4>
          <ul className="text-blue-700 text-xs space-y-1">
            <li>• Check your spam folder</li>
            <li>• Ensure you entered the correct email</li>
            <li>• Wait for the timer to resend</li>
            <li>• Contact support if issues persist</li>
          </ul>
        </div>

        {/* Progress Indicator for Mobile */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index + 1 === currentStep 
                    ? 'bg-blue-600' 
                    : index + 1 < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;