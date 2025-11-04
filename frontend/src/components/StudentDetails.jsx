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
    if (formData.teamMembers.length >= 9) {
      alert('Maximum 9 team members allowed (excluding yourself). Total team size: 10 people.');
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
  const canAddMoreMembers = formData.teamMembers.length < 9;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Glow Effect */}
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-3 drop-shadow-2xl animate-pulse">
            Student Registration
          </h2>
          <p className="text-sm sm:text-lg text-gray-400 font-medium">Complete your profile to unlock the experience</p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Primary Student Details - Black Card with Neon Accents */}
        <div className="bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:border-cyan-400/50">
          <h3 className="text-lg sm:text-2xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-6 sm:mb-8 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/50">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            {isTeamParticipation ? 'Team Lead Details' : 'Student Details'} *
          </h3>

          {/* single grid wrapper (removed extra nested grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`w-full px-4 py-3 sm:px-5 sm:py-4 bg-gray-900/50 border-2 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 text-white text-sm sm:text-base transition-all duration-300 placeholder-gray-500 ${errors.fullName ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-cyan-500/50'}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-400 text-xs sm:text-sm mt-2 font-semibold">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 sm:px-5 sm:py-4 bg-gray-900/50 border-2 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 text-white text-sm sm:text-base transition-all duration-300 placeholder-gray-500 ${errors.email ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-cyan-500/50'}`}
                placeholder="your.email@college.edu"
              />
              {errors.email && <p className="text-red-400 text-xs sm:text-sm mt-2 font-semibold">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-4 py-3 sm:px-5 sm:py-4 bg-gray-900/50 border-2 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 text-white text-sm sm:text-base transition-all duration-300 placeholder-gray-500 ${errors.phone ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-cyan-500/50'}`}
                placeholder="9876543210"
              />
              {errors.phone && <p className="text-red-400 text-xs sm:text-sm mt-1.5 font-medium">{errors.phone}</p>}
            </div>

            {/* College */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-cyan-400 mb-2">
                <School className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-cyan-400" />
                College/University *
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => handleChange('college', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 text-white text-sm sm:text-base transition-all duration-200 ${errors.college ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-cyan-500/50 bg-gray-900/50'}`}
                placeholder="Your college name"
              />
              {errors.college && <p className="text-red-400 text-xs sm:text-sm mt-1.5 font-medium">{errors.college}</p>}
            </div>

            {/* Year */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-cyan-400 mb-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-cyan-400" />
                Year of Study *
              </label>
              <select
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 text-white text-sm sm:text-base transition-all duration-200 ${errors.year ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-cyan-500/50 bg-gray-900/50'}`}
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
                <option value="5">Fifth Year</option>
              </select>
              {errors.year && <p className="text-red-400 text-xs sm:text-sm mt-1.5 font-medium">{errors.year}</p>}
            </div>

            {/* Roll Number */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-cyan-400 mb-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-cyan-400" />
                Roll Number *
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => handleChange('rollNumber', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 text-white text-sm sm:text-base transition-all duration-200 ${errors.rollNumber ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-cyan-500/50 bg-gray-900/50'}`}
                placeholder="Enter your roll number"
              />
              {errors.rollNumber && <p className="text-red-400 text-xs sm:text-sm mt-1.5 font-medium">{errors.rollNumber}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-cyan-400 mb-2">
                <School className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-cyan-400" />
                Department *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 text-white text-sm sm:text-base transition-all duration-200 ${errors.department ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-cyan-500/50 bg-gray-900/50'}`}
                placeholder="Enter your department"
              />
              {errors.department && <p className="text-red-400 text-xs sm:text-sm mt-1.5 font-medium">{errors.department}</p>}
            </div>

            {/* Participation Type */}
            <div className="md:col-span-2">
              <label className="flex items-center text-xs sm:text-sm font-semibold text-cyan-400 mb-3">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-cyan-400" />
                Participation Type *
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleChange('participationType', 'individual')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                    formData.participationType === 'individual'
                      ? 'border-cyan-400 bg-cyan-900/20 shadow-lg transform scale-105'
                      : 'border-gray-700 hover:border-blue-300 bg-gray-900/50 hover:bg-gray-50'
                  }`}
                >
                  <User className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${
                    formData.participationType === 'individual' ? 'text-cyan-400' : 'text-gray-400'
                  }`} />
                  <div className={`text-sm sm:text-base font-bold ${
                    formData.participationType === 'individual' ? 'text-cyan-400' : 'text-gray-600'
                  }`}>Individual</div>
                  <div className="text-xs text-gray-500 mt-1">Solo participation</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('participationType', 'team')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                    formData.participationType === 'team'
                      ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                      : 'border-gray-700 hover:border-purple-300 bg-gray-900/50 hover:bg-gray-50'
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
          <div className="bg-gradient-to-br from-gray-800/80 via-purple-900/30 to-black/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-2xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/50">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                Team Members (Min 3, Max 10)
              </h3>
              <button
                type="button"
                onClick={addTeamMember}
                disabled={!canAddMoreMembers}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black transition-all duration-300 text-xs sm:text-sm ${
                  canAddMoreMembers
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-400/60 transform hover:scale-105 border border-purple-400/50'
                    : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>

            {errors.teamMembers && (
              <div className="mb-4 p-4 sm:p-5 bg-gradient-to-r from-red-900/40 to-orange-900/40 border-2 border-red-500 rounded-xl shadow-lg animate-pulse backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">⚠️</span>
                  <p className="text-red-400 text-sm sm:text-base font-black">{errors.teamMembers}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="bg-gray-900/50 border-2 border-purple-500/30 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
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
                      className="text-red-500 hover:text-red-700 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-cyan-400 mb-2 block flex items-center">
                        <User className="w-3 h-3 mr-1 text-purple-600" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={member.fullName}
                        onChange={(e) => updateTeamMember(index, 'fullName', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 text-white text-sm transition-all duration-200 ${errors[`teamMemberName_${index}`] ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-purple-500/50 bg-gray-900/50'}`}
                        placeholder="Team member full name"
                      />
                      {errors[`teamMemberName_${index}`] && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors[`teamMemberName_${index}`]}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-cyan-400 mb-2 block flex items-center">
                        <Mail className="w-3 h-3 mr-1 text-purple-600" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 text-white text-sm transition-all duration-200 ${errors[`teamMemberEmail_${index}`] ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-purple-500/50 bg-gray-900/50'}`}
                        placeholder="team.member@college.edu"
                      />
                      {errors[`teamMemberEmail_${index}`] && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors[`teamMemberEmail_${index}`]}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-cyan-400 mb-2 block flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-purple-600" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => updateTeamMember(index, 'phone', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 text-white text-sm transition-all duration-200 ${errors[`teamMemberPhone_${index}`] ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-purple-500/50 bg-gray-900/50'}`}
                        placeholder="9876543210"
                      />
                      {errors[`teamMemberPhone_${index}`] && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors[`teamMemberPhone_${index}`]}</p>}
                    </div>

                    {/* College (optional) */}
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-cyan-400 mb-2 block flex items-center">
                        <School className="w-3 h-3 mr-1 text-purple-600" />
                        College/University
                      </label>
                      <input
                        type="text"
                        value={member.college}
                        onChange={(e) => updateTeamMember(index, 'college', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-700 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 text-white text-sm hover:border-purple-500/50 transition-all duration-200 bg-gray-900/50"
                        placeholder="College name"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help text */}
            {formData.teamMembers.length < 2 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-500/30 rounded-xl relative z-10">
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

        <div className="flex justify-between items-center pt-6 border-t-2 border-cyan-500/30">
          <div className="text-xs sm:text-sm text-gray-400">
            {isTeamParticipation ? (
              <>Total Team Size: <strong className="text-cyan-400">{formData.teamMembers.length + 1}</strong> (Min: 3, Max: 10)</>
            ) : (
              <>Participation Type: <strong className="capitalize text-cyan-400">{formData.participationType}</strong></>
            )}
          </div>
          <button type="submit" className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 transition-all duration-300 font-black shadow-lg shadow-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-400/60 transform hover:scale-105 text-sm sm:text-base border border-cyan-400/50">
            Continue to Event Selection →
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default StudentDetails;
