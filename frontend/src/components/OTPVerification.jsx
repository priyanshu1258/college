import React, { useState, useEffect, useRef } from 'react';
import { Mail, Clock, RotateCcw, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../api/client';

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

      const response = await apiRequest('/api/send-otp', {
        method: 'POST',
        body: { email }
      });

      if (response.success) {
        console.log("✅ OTP sent successfully");

        if (response.developmentOTP) {
          setGeneratedOTP(response.developmentOTP);
        } else {
          const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOTP(testOTP);
        }

        setTimer(60);
      } else {
        setMessage(response.message || 'Failed to send OTP');
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

      const response = await apiRequest('/api/verify-otp', {
        method: 'POST',
        body: { 
          email, 
          otp: otpString 
        }
      });

      console.log('📨 Backend OTP response:', response);

      if (response.success) {
        console.log("✅ OTP verified successfully");
        updateFormData({ 
          verified: true,
          otpVerified: true,
          ...formData
        });
        nextStep();
      } else {
        setMessage(response.error || response.message || 'Invalid OTP. Please try again.');
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
    <div className="p-4 sm:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-[600px]">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-200 p-4 sm:p-8 max-w-2xl mx-auto">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevStep}
            disabled={loading}
            className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm sm:text-base">Back</span>
          </button>
          
          <div className="text-xs sm:text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold border-2 border-blue-300">
            Step {currentStep}/{totalSteps}
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Verify Your Email
          </h2>
          
          <p className="text-gray-700 text-sm sm:text-base mb-2 font-semibold">
            We've sent a 6-digit OTP to
          </p>
          <p className="font-bold text-blue-600 text-base sm:text-lg break-all px-2 sm:px-4 bg-blue-50 py-2 rounded-lg inline-block">{userEmail}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-3 font-medium">
            ⏰ The OTP will expire in 10 minutes
          </p>
        </div>

        {/* CRITICAL SPAM FOLDER WARNING - LARGE AND PROMINENT */}
        <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-red-100 to-orange-100 border-4 border-red-500 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="text-5xl sm:text-6xl flex-shrink-0 animate-bounce">📮</div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="font-black text-red-900 text-lg sm:text-xl mb-2 uppercase tracking-wide">
                ⚠️ CHECK YOUR SPAM FOLDER! ⚠️
              </h3>
              <p className="text-red-800 text-sm sm:text-base font-bold leading-relaxed">
                Our emails often go to spam/junk folders. 
                <span className="block mt-2 bg-red-200 px-3 py-2 rounded-lg text-red-900 text-base sm:text-lg animate-pulse">
                  📧 Look in your SPAM folder NOW!
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* OTP Input - Enhanced & Engaging */}
        <div className="mb-6">
          <p className="text-center text-gray-700 font-bold mb-4 text-base sm:text-lg">
            🔐 Enter 6-Digit OTP
          </p>
          <div className="flex justify-center gap-2 sm:gap-3 px-2 sm:px-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-11 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-black border-3 border-blue-400 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all text-gray-900 bg-gradient-to-br from-white to-blue-50 shadow-lg hover:shadow-xl transform hover:scale-105 flex-1 max-w-[50px] sm:max-w-[60px]"
                disabled={loading}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>
        </div>

        {/* Timer/Resend Section - Enhanced */}
        <div className="text-center mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
          {timer > 0 ? (
            <div className="flex items-center justify-center text-blue-700 font-bold text-sm sm:text-base">
              <Clock className="w-5 h-5 mr-2 animate-pulse" />
              ⏳ Resend OTP in <span className="text-orange-600 mx-1 text-lg">{timer}s</span>
            </div>
          ) : (
            <button
              onClick={sendOTP}
              disabled={loading}
              className="flex items-center justify-center text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all mx-auto text-sm sm:text-base font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              🔄 Resend OTP
            </button>
          )}
        </div>

        {/* Message Display - Enhanced */}
        {message && (
          <div className={`text-center mb-6 p-4 rounded-xl text-sm sm:text-base font-bold shadow-lg ${
            message.includes('successfully') || message.includes('test OTP') || message.includes('✅')
              ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 border-2 border-green-500' 
              : message.includes('❌') || message.includes('Invalid') || message.includes('Failed')
              ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-900 border-2 border-red-500'
              : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 border-2 border-yellow-500'
          }`}>
            {message}
          </div>
        )}

        {/* Verify Button - Enhanced & Engaging */}
        <button
          onClick={verifyOTP}
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 sm:py-5 rounded-xl disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 transition-all font-black text-base sm:text-lg mb-4 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-green-500 disabled:border-gray-500"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              ⏳ Verifying...
            </>
          ) : (
            <>
              <span className="text-2xl mr-2">✅</span>
              Verify OTP
            </>
          )}
        </button>

        {/* Help Section - Enhanced with Spam Emphasis */}
        <div className="mt-4 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-300 shadow-lg">
          <h4 className="font-black text-blue-900 mb-3 text-sm sm:text-base flex items-center justify-center">
            <span className="text-xl mr-2">❓</span>
            Didn't receive the OTP?
          </h4>
          <ul className="text-blue-800 text-xs sm:text-sm space-y-2 font-semibold">
            <li className="flex items-start bg-red-100 p-2 rounded-lg border-2 border-red-400">
              <span className="text-lg mr-2 flex-shrink-0">📮</span>
              <span className="font-black text-red-900">CHECK YOUR SPAM/JUNK FOLDER FIRST!</span>
            </li>
            <li className="flex items-start">
              <span className="text-base mr-2">📧</span>
              Ensure you entered the correct email address
            </li>
            <li className="flex items-start">
              <span className="text-base mr-2">⏰</span>
              Wait for the timer to resend a new OTP
            </li>
            <li className="flex items-start">
              <span className="text-base mr-2">💬</span>
              Contact support if issues persist
            </li>
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