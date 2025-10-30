import React, { useState } from 'react';
import { User, Mail, Phone, School, Calendar, Plus, Trash2, Users, ChevronDown } from 'lucide-react';

const StudentDetails = ({ data, updateData, nextStep }) => {
  const [formData, setFormData] = useState(data || {
    fullName: '',
    email: '',
    phone: '',
    college: '',
    year: '',
    rollNumber: '',
    department: '',
    participationType: 'individual',
    teamMembers: []
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Invalid phone number';
    if (!formData.college.trim()) newErrors.college = 'College name is required';
    if (!formData.year) newErrors.year = 'Year of study is required';
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';

    if (formData.participationType === 'team') {
      // Check minimum team size (team lead + at least 2 members = 3 total)
      if (formData.teamMembers.length < 2) {
        newErrors.teamMembers = 'A team must have at least 3 people total (you + 2 members)';
      }
      
      formData.teamMembers.forEach((member, index) => {
        if (!member.fullName?.trim()) newErrors[`teamMemberName_${index}`] = `Team member ${index + 1} name is required`;
        if (!member.email?.trim()) newErrors[`teamMemberEmail_${index}`] = `Team member ${index + 1} email is required`;
        else if (!/\S+@\S+\.\S+/.test(member.email)) newErrors[`teamMemberEmail_${index}`] = `Team member ${index + 1} email is invalid`;
        if (!member.phone?.trim()) newErrors[`teamMemberPhone_${index}`] = `Team member ${index + 1} phone is required`;
        else if (!/^[6-9]\d{9}$/.test(member.phone.replace(/\s/g, ''))) newErrors[`teamMemberPhone_${index}`] = `Team member ${index + 1} phone is invalid`;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 // In the handleSubmit function, update the data structure:
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Additional check for team participation with alert
  if (formData.participationType === 'team' && formData.teamMembers.length < 2) {
    alert('⚠️ Team Requirement Not Met!\n\nYou need at least 3 people total (including yourself) to participate as a team.\n\nCurrent team size: ' + (formData.teamMembers.length + 1) + '\nRequired minimum: 3\n\nPlease add at least ' + (2 - formData.teamMembers.length) + ' more team member(s) before continuing.');
    return;
  }
  
  if (validateForm()) {
    // Prepare team members data for backend
    const teamMembersData = formData.participationType === 'team' 
      ? formData.teamMembers.map(member => ({
          name: member.fullName,
          email: member.email,
          phone: member.phone,
          college: member.college || formData.college
        }))
      : [];

const submissionData = {
  studentDetails: {  // ✅ This puts data inside studentDetails object
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    college: formData.college,
    year: formData.year,
    rollNumber: formData.rollNumber,
    department: formData.department,
    participationType: formData.participationType,
    teamMembers: teamMembersData
  }
};

     // 🔍 ADD DEBUG LOG HERE
    console.log('🎓 StudentDetails SUBMITTING:', submissionData);
    
    updateData(submissionData);
    nextStep();
  }
};

  const handleChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // When switching to team, automatically add 1 team member
      if (field === 'participationType' && value === 'team' && prev.teamMembers.length === 0) {
        next.teamMembers = [{
          fullName: '',
          email: '',
          phone: '',
          college: prev.college,
          year: '',
          rollNumber: '',
          department: ''
        }];
      }
      // When switching to individual, clear team members
      else if (field === 'participationType' && value === 'individual') {
        next.teamMembers = [];
      }
      return next;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const addTeamMember = () => {
    if (formData.teamMembers.length >= 4) {
      alert('Maximum 4 team members allowed (excluding yourself). Total team size: 5 people.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, {
        fullName: '',
        email: '',
        phone: '',
        college: prev.college,
        year: '',
        rollNumber: '',
        department: ''
      }]
    }));
    if (errors.teamMembers) setErrors(prev => ({ ...prev, teamMembers: '' }));
  };

  const removeTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('teamMember') && key.endsWith(`_${index}`)) delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const updateTeamMember = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
    // fix: clear the correct error key name
    const map = { fullName: 'Name', email: 'Email', phone: 'Phone' };
    const key = map[field] ? `teamMember${map[field]}_${index}` : null;
    if (key && errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const isTeamParticipation = formData.participationType === 'team';
  const canAddMoreMembers = formData.teamMembers.length < 4;

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Student Information
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Please provide your basic details to continue</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Primary Student Details */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            {isTeamParticipation ? 'Team Lead Details' : 'Student Details'} *
          </h3>

          {/* single grid wrapper (removed extra nested grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-gray-900 text-sm sm:text-base transition-all duration-200 ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-600 text-xs sm:text-sm mt-1.5 font-medium">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-gray-900 text-sm sm:text-base transition-all duration-200 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
                placeholder="your.email@college.edu"
              />
              {errors.email && <p className="text-red-600 text-xs sm:text-sm mt-1.5 font-medium">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-gray-900 text-sm sm:text-base transition-all duration-200 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
                placeholder="9876543210"
              />
              {errors.phone && <p className="text-red-600 text-xs sm:text-sm mt-1.5 font-medium">{errors.phone}</p>}
            </div>

            {/* College */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <School className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                College/University *
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => handleChange('college', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-gray-900 text-sm sm:text-base transition-all duration-200 ${errors.college ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
                placeholder="Your college name"
              />
              {errors.college && <p className="text-red-600 text-xs sm:text-sm mt-1.5 font-medium">{errors.college}</p>}
            </div>

            {/* Year */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                Year of Study *
              </label>
              <select
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-gray-900 text-sm sm:text-base transition-all duration-200 ${errors.year ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
                <option value="5">Fifth Year</option>
              </select>
              {errors.year && <p className="text-red-600 text-xs sm:text-sm mt-1.5 font-medium">{errors.year}</p>}
            </div>

            {/* Roll Number */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                Roll Number *
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => handleChange('rollNumber', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-gray-900 text-sm sm:text-base transition-all duration-200 ${errors.rollNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
                placeholder="Enter your roll number"
              />
              {errors.rollNumber && <p className="text-red-600 text-xs sm:text-sm mt-1.5 font-medium">{errors.rollNumber}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <School className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                Department *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-gray-900 text-sm sm:text-base transition-all duration-200 ${errors.department ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
                placeholder="Enter your department"
              />
              {errors.department && <p className="text-red-600 text-xs sm:text-sm mt-1.5 font-medium">{errors.department}</p>}
            </div>

            {/* Participation Type */}
            <div className="md:col-span-2">
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                Participation Type *
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleChange('participationType', 'individual')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                    formData.participationType === 'individual'
                      ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                      : 'border-gray-300 hover:border-blue-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <User className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${
                    formData.participationType === 'individual' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className={`text-sm sm:text-base font-bold ${
                    formData.participationType === 'individual' ? 'text-blue-600' : 'text-gray-600'
                  }`}>Individual</div>
                  <div className="text-xs text-gray-500 mt-1">Solo participation</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('participationType', 'team')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                    formData.participationType === 'team'
                      ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                      : 'border-gray-300 hover:border-purple-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Users className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${
                    formData.participationType === 'team' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <div className={`text-sm sm:text-base font-bold ${
                    formData.participationType === 'team' ? 'text-purple-600' : 'text-gray-600'
                  }`}>Team</div>
                  <div className="text-xs text-gray-500 mt-1">With teammates</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        {isTeamParticipation && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 sm:p-8 shadow-lg">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                Team Members (Min 3, Max 4)
              </h3>
              <button
                type="button"
                onClick={addTeamMember}
                disabled={!canAddMoreMembers}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                  canAddMoreMembers
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>

            {errors.teamMembers && (
              <div className="mb-4 p-4 sm:p-5 bg-gradient-to-r from-red-100 to-orange-100 border-4 border-red-500 rounded-xl shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">⚠️</span>
                  <p className="text-red-900 text-sm sm:text-base font-black">{errors.teamMembers}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="bg-white border-2 border-purple-200 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm sm:text-base font-bold text-purple-600 flex items-center">
                      <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs mr-2">
                        {index + 1}
                      </span>
                      Team Member {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                        <User className="w-3 h-3 mr-1 text-purple-600" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={member.fullName}
                        onChange={(e) => updateTeamMember(index, 'fullName', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 text-gray-900 text-sm transition-all duration-200 ${errors[`teamMemberName_${index}`] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-400 bg-white'}`}
                        placeholder="Team member full name"
                      />
                      {errors[`teamMemberName_${index}`] && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors[`teamMemberName_${index}`]}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                        <Mail className="w-3 h-3 mr-1 text-purple-600" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 text-gray-900 text-sm transition-all duration-200 ${errors[`teamMemberEmail_${index}`] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-400 bg-white'}`}
                        placeholder="team.member@college.edu"
                      />
                      {errors[`teamMemberEmail_${index}`] && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors[`teamMemberEmail_${index}`]}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-purple-600" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => updateTeamMember(index, 'phone', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 text-gray-900 text-sm transition-all duration-200 ${errors[`teamMemberPhone_${index}`] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-400 bg-white'}`}
                        placeholder="9876543210"
                      />
                      {errors[`teamMemberPhone_${index}`] && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors[`teamMemberPhone_${index}`]}</p>}
                    </div>

                    {/* College (optional) */}
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                        <School className="w-3 h-3 mr-1 text-purple-600" />
                        College/University
                      </label>
                      <input
                        type="text"
                        value={member.college}
                        onChange={(e) => updateTeamMember(index, 'college', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 text-gray-900 text-sm hover:border-purple-400 transition-all duration-200 bg-white"
                        placeholder="College name"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help text */}
            {formData.teamMembers.length < 2 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl relative z-10">
                <p className="text-purple-700 text-xs sm:text-sm flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  <span>
                    <strong className="font-bold">Important:</strong> A team must have a minimum of 3 people total (you + at least 2 members). You can add up to 3 more members (max 4 total).
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
          <div className="text-xs sm:text-sm text-gray-600">
            {isTeamParticipation ? (
              <>Total Team Size: <strong className="text-blue-600">{formData.teamMembers.length + 1}</strong> (Min: 3, Max: 4)</>
            ) : (
              <>Participation Type: <strong className="capitalize text-blue-600">{formData.participationType}</strong></>
            )}
          </div>
          <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base">
            Continue to OTP →
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default StudentDetails;