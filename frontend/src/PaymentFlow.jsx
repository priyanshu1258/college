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
  const handlePaymentSuccess = (verificationResult) => {
    console.log('💳 Payment verification received:', verificationResult);
    
    // Update form data with verification information
    updateFormData({
      upiVerification: verificationResult,
      upiVerified: true,
      paymentStatus: 'verified'
    });
    
    // Since verification is already done in DirectUPIPayment modal,
    // we need to trigger the registration submission
    // Call handleUPIVerification directly instead of going to next step
    handleUPIVerification(verificationResult);
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
        includeAccommodation: latestFormData.eventSelection?.includeAccommodation ?? false,
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
          includeFood: eventSelection.includeFood,
          includeAccommodation: eventSelection.includeAccommodation,
          teamId: result.teamId,
          teamMembers: latestFormData.studentDetails?.teamMembers || [],
          participationType: latestFormData.studentDetails?.participationType || 'individual'
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

  // Generate and Download PDF
  const downloadRegistrationPDF = (registrationData) => {
    // Create PDF content as HTML
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: letter;
      margin: 0;
    }
    body {
      font-family: 'Arial', sans-serif;
      padding: 15px 20px;
      margin: 0;
      background: white;
      width: 8.5in;
      min-height: 11in;
      box-sizing: border-box;
    }
    .certificate {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #2563eb;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .logo {
      font-size: 20px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 5px;
    }
    .subtitle {
      color: #6b7280;
      font-size: 11px;
    }
    .title {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      text-align: center;
      margin: 10px 0;
    }
    .reg-id {
      background: #dbeafe;
      padding: 8px;
      border-radius: 6px;
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      color: #1e40af;
      margin: 10px 0;
      border: 2px dashed #2563eb;
    }
    .details-section {
      margin: 15px 0;
    }
    .detail-row {
      display: flex;
      padding: 6px 8px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 12px;
    }
    .detail-label {
      font-weight: bold;
      color: #374151;
      width: 150px;
      flex-shrink: 0;
    }
    .detail-value {
      color: #1f2937;
      flex: 1;
      word-break: break-word;
    }
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 9px;
      line-height: 1.4;
    }
    .success-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 5px 15px;
      border-radius: 15px;
      font-size: 11px;
      font-weight: bold;
      margin: 5px 0;
    }
    .instructions {
      background: #fef3c7;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #f59e0b;
      margin: 15px 0;
    }
    .instructions h3 {
      color: #92400e;
      margin: 0 0 6px 0;
      font-size: 12px;
    }
    .instructions ul {
      margin: 0;
      padding-left: 18px;
      color: #78350f;
      font-size: 10px;
      line-height: 1.5;
    }
    .instructions li {
      margin-bottom: 3px;
    }
    @media print {
      body {
        padding: 15px 20px;
      }
      .certificate {
        box-shadow: none;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="logo">🎓 TECH FEST CHAITANYA 2025</div>
      <div class="subtitle">Himachal Pradesh Technical University</div>
    </div>
    
    <div class="title">✅ Registration Confirmation</div>
    
    <div style="text-align: center;">
      <span class="success-badge">SUCCESSFULLY REGISTERED</span>
    </div>
    
    <div class="reg-id">
      Registration ID: ${registrationData.registrationId}
    </div>
    
    <div class="details-section">
      <div class="detail-row">
        <span class="detail-label">👤 Participant Name:</span>
        <span class="detail-value">${registrationData.studentName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">🎯 Event(s):</span>
        <span class="detail-value">${registrationData.event}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">💰 Amount Paid:</span>
        <span class="detail-value">₹${registrationData.amount}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">🍽️ Food Package:</span>
        <span class="detail-value">${registrationData.includeFood ? '✅ Included' : '❌ Not Included'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">🏨 Accommodation:</span>
        <span class="detail-value">${registrationData.includeAccommodation ? '✅ Included' : '❌ Not Included'}</span>
      </div>
      ${registrationData.teamId && registrationData.teamId !== 'INDIVIDUAL' ? `
      <div class="detail-row">
        <span class="detail-label">👥 Team ID:</span>
        <span class="detail-value">${registrationData.teamId}</span>
      </div>
      ` : ''}
      ${registrationData.teamMembers && registrationData.teamMembers.length > 0 ? `
      <div class="detail-row">
        <span class="detail-label">👥 Team Members:</span>
        <span class="detail-value">
          ${registrationData.teamMembers.map((member, index) => 
            `${index + 1}. ${member.name} (${member.email})`
          ).join('<br>')}
        </span>
      </div>
      ` : ''}
      <div class="detail-row">
        <span class="detail-label">📅 Registration Date:</span>
        <span class="detail-value">${new Date().toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</span>
      </div>
    </div>
    
    <div class="instructions">
      <h3>📋 Important Instructions:</h3>
      <ul>
        <li>Keep this confirmation safe for event entry</li>
        <li>Bring valid ID card on event day</li>
        <li>Check email for schedule updates</li>
        ${registrationData.teamId && registrationData.teamId !== 'INDIVIDUAL' ? 
          `<li>Share Team ID (${registrationData.teamId}) with all members</li>` : ''}
        <li>Reach venue 30 minutes before start time</li>
      </ul>
    </div>
    
    <div class="footer">
      <p style="margin: 3px 0;"><strong>Contact Information:</strong></p>
      <p style="margin: 2px 0;">📧 chaitanyahptu@gmail.com | 📞 Tech Team: Priyanshu Attri - 7018753204 | 🌐 techfest.chaitanya.ac.in</p>
      <p style="margin: 8px 0 2px 0;">This is a computer-generated document. No signature required.</p>
      <p style="margin: 2px 0;">Generated on ${new Date().toLocaleString('en-IN')}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Create a blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TechFest_Registration_${registrationData.registrationId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Also print option
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Success Component - Enhanced & Professional
  const RegistrationSuccess = ({ registrationData, onReset }) => {
    const [confettiActive, setConfettiActive] = React.useState(true);

    React.useEffect(() => {
      // Stop confetti animation after 5 seconds
      const timer = setTimeout(() => setConfettiActive(false), 5000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        {confettiActive && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  fontSize: `${20 + Math.random() * 20}px`
                }}
              >
                {['🎉', '🎊', '✨', '🎈', '🎆', '⭐'][Math.floor(Math.random() * 6)]}
              </div>
            ))}
          </div>
        )}

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Success Header with Animation */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block relative mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4">
              🎉 Registration Successful! 🎉
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 font-semibold max-w-2xl mx-auto">
              Welcome to <span className="text-blue-600 font-black">Tech Fest Chaitanya 2025</span>!<br />
              Your journey to innovation begins here.
            </p>
          </div>

          {/* Registration ID Card - Prominent Display */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-1 mb-8 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="bg-white rounded-xl p-6 sm:p-8">
              <div className="text-center">
                <div className="inline-block bg-green-100 px-4 py-2 rounded-full mb-4">
                  <span className="text-green-800 font-black text-sm">✅ CONFIRMED</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Your Registration ID</h2>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-4 border-blue-500 rounded-xl p-4 sm:p-6 mb-4">
                  <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wider">
                    {registrationData.registrationId}
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-semibold">
                  📸 Save this ID - You'll need it for event entry!
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Registration Details Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-xl font-black text-gray-900">Registration Details</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-xl mr-3">👤</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 font-semibold">Participant Name</div>
                    <div className="font-bold text-gray-900">{registrationData.studentName}</div>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-xl mr-3">🎯</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 font-semibold">Event(s)</div>
                    <div className="font-bold text-gray-900">{registrationData.event}</div>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-xl mr-3">💰</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 font-semibold">Amount Paid</div>
                    <div className="font-bold text-green-600 text-xl">₹{registrationData.amount}</div>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-xl mr-3">🍽️</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 font-semibold">Food Package</div>
                    <div className="font-bold text-gray-900">
                      {registrationData.includeFood ? '✅ Included' : '❌ Not Included'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-xl mr-3">🏨</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 font-semibold">Accommodation</div>
                    <div className="font-bold text-gray-900">
                      {registrationData.includeAccommodation ? '✅ Included' : '❌ Not Included'}
                    </div>
                  </div>
                </div>
                {registrationData.teamId && registrationData.teamId !== 'INDIVIDUAL' && (
                  <div className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-xl mr-3">👥</span>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 font-semibold">Team ID</div>
                      <div className="font-bold text-gray-900">{registrationData.teamId}</div>
                    </div>
                  </div>
                )}
                {registrationData.teamMembers && registrationData.teamMembers.length > 0 && (
                  <div className="flex items-start p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <span className="text-xl mr-3">👥</span>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 font-semibold mb-2">Team Members</div>
                      <div className="space-y-1">
                        {registrationData.teamMembers.map((member, index) => (
                          <div key={index} className="text-sm font-semibold text-gray-800">
                            {index + 1}. {member.name}
                            <span className="text-xs text-gray-600 ml-2">({member.email})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xl mr-3">📅</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 font-semibold">Registration Date</div>
                    <div className="font-bold text-gray-900">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-black text-gray-900">What's Next?</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <span className="text-lg mr-2 flex-shrink-0">📧</span>
                  <span className="text-sm text-gray-700 font-semibold">Confirmation email sent to your inbox after the manual verification by our tech team :)</span>
                </li>
                <li className="flex items-start p-3 bg-purple-50 rounded-lg">
                  <span className="text-lg mr-2 flex-shrink-0">📱</span>
                  <span className="text-sm text-gray-700 font-semibold">Download your registration certificate</span>
                </li>
                {registrationData.teamId && registrationData.teamId !== 'INDIVIDUAL' && (
                  <li className="flex items-start p-3 bg-yellow-50 rounded-lg">
                    <span className="text-lg mr-2 flex-shrink-0">👥</span>
                    <span className="text-sm text-gray-700 font-semibold">Share Team ID: <strong className="text-orange-600">{registrationData.teamId}</strong> with members</span>
                  </li>
                )}
                <li className="flex items-start p-3 bg-green-50 rounded-lg">
                  <span className="text-lg mr-2 flex-shrink-0">🎫</span>
                  <span className="text-sm text-gray-700 font-semibold">Bring Registration ID & valid ID card on event day</span>
                </li>
                <li className="flex items-start p-3 bg-red-50 rounded-lg">
                  <span className="text-lg mr-2 flex-shrink-0">⏰</span>
                  <span className="text-sm text-gray-700 font-semibold">Arrive 30 minutes before event start time</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => downloadRegistrationPDF(registrationData)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center"
            >
              <span className="text-2xl mr-3">📄</span>
              Download Registration Certificate
            </button>
            
            <button
              onClick={onReset}
              className="bg-white text-gray-800 border-3 border-gray-300 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center"
            >
              <span className="text-2xl mr-3">➕</span>
              Register Another Participant
            </button>
          </div>

          {/* Contact Support Card */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start">
              <span className="text-4xl mr-4">💬</span>
              <div className="flex-1">
                <h3 className="text-lg font-black text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-700 mb-3">Our support team is here to assist you!</p>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="mailto:chaitanyahptu@gmail.com"
                    className="inline-flex items-center bg-white px-4 py-2 rounded-lg border-2 border-orange-300 text-sm font-bold text-gray-800 hover:bg-orange-100 transition-colors"
                  >
                    <span className="mr-2">📧</span>
                    chaitanyahptu@gmail.com
                  </a>
                  <a 
                    href="tel:7018753204"
                    className="inline-flex items-center bg-white px-4 py-2 rounded-lg border-2 border-orange-300 text-sm font-bold text-gray-800 hover:bg-orange-100 transition-colors"
                  >
                    <span className="mr-2">📞</span>
                    Priyanshu: 7018753204
                  </a>
                  <div className="inline-flex items-center bg-white px-4 py-2 rounded-lg border-2 border-orange-300 text-sm font-bold text-gray-800">
                    <span className="mr-2">🌐</span>
                    techfest.chaitanya.ac.in
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Show success screen or normal flow */}
        {registrationComplete ? (
          <RegistrationSuccess 
            registrationData={finalRegistrationData} 
            onReset={resetForm} 
          />
        ) : (
          <>
            {/* Header with Logo */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CHAITANYA 2025
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">Complete your registration in {steps.length} simple steps</p>
            </div>

            {/* Progress Bar - Enhanced */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-8 mb-4 sm:mb-8 backdrop-blur-lg bg-opacity-90">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-gray-800">{steps[currentStep]?.name}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Step {currentStep + 1} of {steps.length}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:block text-xs sm:text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold border border-blue-200">
                    {Math.round((currentStep / (steps.length - 1)) * 100)}% Complete
                  </div>
                </div>
              </div>
              
              {/* Progress Steps */}
              <div className="relative">
                <div className="flex justify-between mb-3">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex flex-col items-center flex-1 relative z-10">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-bold
                        ${currentStep >= index 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transform scale-110' 
                          : 'bg-gray-200 text-gray-500'
                        } 
                        ${currentStep === index ? 'ring-4 ring-blue-200 ring-opacity-50 animate-pulse' : ''}
                        transition-all duration-500 ease-out`}>
                        {currentStep > index ? (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        ) : step.number}
                      </div>
                      <span className={`text-[9px] sm:text-xs mt-2 text-center px-1 leading-tight font-medium ${
                        currentStep >= index ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Animated Progress Line */}
                <div className="absolute top-5 sm:top-6 left-0 right-0 h-1 bg-gray-200 rounded-full -z-0" style={{ margin: '0 5%' }}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Current Step Component - Enhanced Card */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-lg bg-opacity-95 transform transition-all duration-300 hover:shadow-3xl">
              {CurrentComponent ? (
                <CurrentComponent {...getComponentProps()} />
              ) : finalRegistrationData ? (
                <RegistrationSuccess 
                  registrationData={finalRegistrationData} 
                  onReset={resetForm}
                />
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