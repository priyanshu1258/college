// src/PaymentFlow.jsx
import React, { useState, useRef } from 'react';
import EventSelection from './components/EventSelection';
import StudentDetails from './components/StudentDetails';
import UPIVerification from './components/UPIVerification';
import DirectUPIPayment from './components/DirectUPIPayment';
import OTPVerification from './components/OTPVerification';
import { register } from './api/register';

const PaymentFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    studentDetails: {},
    eventSelection: {},
    paymentData: {},
    otpVerified: false,
    upiVerified: false
  });
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [finalRegistrationData, setFinalRegistrationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // FIX: Use useRef for immediate submission tracking
  const submissionInProgress = useRef(false);

  const steps = [
    { number: 1, name: 'Student Details', component: StudentDetails },
    { number: 2, name: 'OTP Verification', component: OTPVerification },
    { number: 3, name: 'Event Selection', component: EventSelection },
    { number: 4, name: 'Payment', component: DirectUPIPayment },
    { number: 5, name: 'UPI Verification', component: UPIVerification }
  ];

  const CurrentComponent = steps[currentStep]?.component;

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // Handle payment success from DirectUPIPayment
  const handlePaymentSuccess = (paymentResult) => {
    updateFormData({
      paymentData: paymentResult,
      paymentStatus: 'completed'
    });
    nextStep();
  };

  // Handle payment failure from DirectUPIPayment
  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
  };

  // Handle UPI verification submission - COMPLETELY FIXED
  const handleUPIVerification = async (verificationData) => {
    console.log('🔄 UPI verification submitted - Checking for duplicates...');
    
    // FIX: Immediate check with ref
    if (submissionInProgress.current) {
      console.log('❌ BLOCKED: Submission already in progress');
      return;
    }
    
    // FIX: Set ref immediately
    submissionInProgress.current = true;
    setIsSubmitting(true);
    
    console.log('✅ Starting submission process...');

    try {
      // Create updated form data WITHOUT waiting for state update
      const updatedFormData = {
        ...formData,
        upiVerification: verificationData,
        upiVerified: true
      };

      // Update state for UI (but don't wait for it)
      setFormData(updatedFormData);
      
      // Submit immediately - no setTimeout, no waiting for state updates
      console.log('🚀 Calling submitFinalRegistration...');
      await submitFinalRegistration(updatedFormData);
      
    } catch (error) {
      console.error('❌ Error in UPI verification:', error);
      // FIX: Reset submission state on error
      submissionInProgress.current = false;
      setIsSubmitting(false);
      alert('Submission failed. Please try again.');
    }
  };
  
  // SUBMIT FINAL REGISTRATION - FIXED
  const submitFinalRegistration = async (latestFormData) => {
    try {
      console.log('🔍 SUBMITTING FINAL REGISTRATION - SINGLE CALL');
     
      // Create proper eventSelection structure for backend
      const eventSelection = {
        selectedEvents: latestFormData.eventSelection?.selectedEvents || [],
        selectedEventsData: latestFormData.eventSelection?.selectedEventsData || [],
        selectedEsportsGame: latestFormData.eventSelection?.selectedEsportsGame || '',
        includeFood: latestFormData.eventSelection?.includeFood ?? true,
        totalAmount: latestFormData.eventSelection?.totalAmount || 0,
        eventCount: latestFormData.eventSelection?.eventCount || 0,
        participantCount: latestFormData.eventSelection?.participantCount || 1,
        eventName: latestFormData.eventSelection?.selectedEventsData?.length === 1 
          ? latestFormData.eventSelection.selectedEventsData[0].name 
          : latestFormData.eventSelection?.selectedEventsData?.map(event => event.name).join(', ') || 'Multiple Events',
        price: latestFormData.eventSelection?.totalAmount || 0,
        eventId: latestFormData.eventSelection?.selectedEvents?.length === 1 
          ? latestFormData.eventSelection.selectedEvents[0] 
          : 'multiple'
      };

      // Create paymentData WITH UPI verification data
      const paymentDataWithUPI = {
        ...latestFormData.paymentData,
        upiTransactionId: latestFormData.upiVerification?.upiTransactionId || '',
        payerName: latestFormData.upiVerification?.payerName || '',
        payerUPI: latestFormData.upiVerification?.payerUPI || '',
        verificationData: latestFormData.upiVerification || {}
      };

      console.log('💰 FINAL PAYMENT DATA WITH UPI VERIFICATION:', paymentDataWithUPI);

      const registrationData = {
        studentDetails: latestFormData.studentDetails,
        eventSelection: eventSelection,
        paymentData: paymentDataWithUPI,
        participationType: latestFormData.studentDetails?.participationType || 'individual',
        teamMembers: latestFormData.studentDetails?.teamMembers || []
      };

      console.log('🔍 FINAL REGISTRATION DATA BEING SENT:', registrationData);

      const result = await register(registrationData);

      if (result.success) {
        console.log('✅ Registration completed successfully:', result);
        setFinalRegistrationData({
          registrationId: result.registrationId,
          studentName: result.registration?.studentName || latestFormData.studentDetails.fullName,
          event: result.registration?.event || eventSelection.eventName,
          amount: result.registration?.amount || eventSelection.totalAmount,
          teamId: result.teamId
        });
        setRegistrationComplete(true);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error; // Re-throw to handle in caller
    } finally {
      // FIX: Always reset submission state
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  // Reset the entire form
  const resetForm = () => {
    setRegistrationComplete(false);
    setFinalRegistrationData(null);
    setCurrentStep(0);
    setFormData({
      studentDetails: {},
      eventSelection: {},
      paymentData: {},
      otpVerified: false,
      upiVerified: false
    });
    submissionInProgress.current = false;
    setIsSubmitting(false);
  };

  // Success Component
  const RegistrationSuccess = ({ registrationData, onReset }) => {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Complete!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for registering for Tech Fest Chaitanya 2025!
        </p>

        {/* Registration Details */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-6">
          <h3 className="font-semibold text-green-800 mb-4">Registration Details</h3>
          <div className="text-left space-y-2 text-sm text-zinc-600">
            <p><strong>Registration ID:</strong> {registrationData.registrationId}</p>
            <p><strong>Name:</strong> {registrationData.studentName}</p>
            <p><strong>Event:</strong> {registrationData.event}</p>
            <p><strong>Amount Paid:</strong> ₹{registrationData.amount}</p>
            {registrationData.teamId && registrationData.teamId !== 'INDIVIDUAL' && (
              <p><strong>Team ID:</strong> {registrationData.teamId}</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
          <ul className="text-blue-700 text-sm space-y-1 text-left">
            <li>• You will receive a confirmation email shortly</li>
            <li>• Keep your registration ID handy</li>
            {registrationData.teamId && registrationData.teamId !== 'INDIVIDUAL' && (
              <li>• Share your Team ID with team members: <strong>{registrationData.teamId}</strong></li>
            )}
            <li>• Check your email for event schedule and updates</li>
            <li>• Contact us at chaitanyahptu@gmail.com for any queries</li>
          </ul>
        </div>
        
        <button
          onClick={onReset}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Register Another Participant
        </button>
      </div>
    );
  };

  // Component props
  const getComponentProps = () => {
    const baseProps = {
      formData: formData,
      updateData: updateFormData,
      nextStep: nextStep,
      prevStep: prevStep,
      currentStep: currentStep + 1,
      totalSteps: steps.length
    };

    // Add specific props for certain components
    switch (steps[currentStep]?.name) {
      case 'Payment':
        return {
          ...baseProps,
          amount: formData.eventSelection?.totalAmount || 0,
          onPaymentSuccess: handlePaymentSuccess,
          onPaymentFailure: handlePaymentFailure
        };
      case 'UPI Verification':
        return {
          ...baseProps,
          transactionData: formData.paymentData,
          onVerificationSubmit: handleUPIVerification,
          onCancel: prevStep,
          isSubmitting
        };
      case 'OTP Verification':
        return {
          ...baseProps,
          studentEmail: formData.studentDetails?.email,
          updateFormData: updateFormData
        };
      case 'Event Selection':
        return {
          ...baseProps,
          participationType: formData.studentDetails?.participationType,
          teamSize: formData.studentDetails?.teamMembers?.length + 1 || 1
        };
      default:
        return baseProps;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Show success screen or normal flow */}
        {registrationComplete ? (
          <RegistrationSuccess 
            registrationData={finalRegistrationData} 
            onReset={resetForm} 
          />
        ) : (
          <>
            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 mb-4 sm:mb-8">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Tech Fest Registration</h1>
                <div className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                  Step {currentStep + 1}/{steps.length}
                </div>
              </div>
              
              <div className="flex justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base
                      ${currentStep >= index ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'} 
                      ${currentStep === index ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                      transition-all duration-300`}>
                      {currentStep > index ? '✓' : step.number}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-1 sm:mt-2 text-center px-1 leading-tight ${
                      currentStep >= index ? 'text-green-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Progress line */}
              <div className="relative mt-2">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 transition-all duration-300"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step Component */}
            <div className="bg-white rounded-lg shadow-sm">
              {CurrentComponent ? (
                <CurrentComponent {...getComponentProps()} />
              ) : (
                <div className="p-4 sm:p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Complete!</h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for registering for Tech Fest Chaitanya 2025!
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                    <ul className="text-green-700 text-sm space-y-1 text-left">
                      <li>• You will receive a confirmation email shortly</li>
                      <li>• Keep your registration ID handy</li>
                      <li>• Check your email for event schedule and updates</li>
                      <li>• Contact us at chaitanyahptu@gmail.com for any queries</li>
                    </ul>
                  </div>
                  <button
                    onClick={resetForm}
                    className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register Another Participant
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentFlow;