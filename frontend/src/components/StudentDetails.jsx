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
      formData.teamMembers.forEach((member, index) => {
        if (!member.fullName?.trim()) newErrors[`teamMemberName_${index}`] = `Team member ${index + 1} name is required`;
        if (!member.email?.trim()) newErrors[`teamMemberEmail_${index}`] = `Team member ${index + 1} email is required`;
        else if (!/\S+@\S+\.\S+/.test(member.email)) newErrors[`teamMemberEmail_${index}`] = `Team member ${index + 1} email is invalid`;
        if (!member.phone?.trim()) newErrors[`teamMemberPhone_${index}`] = `Team member ${index + 1} phone is required`;
        else if (!/^[6-9]\d{9}$/.test(member.phone.replace(/\s/g, ''))) newErrors[`teamMemberPhone_${index}`] = `Team member ${index + 1} phone is invalid`;
      });
      if (formData.teamMembers.length === 0) newErrors.teamMembers = 'At least one team member is required for team participation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 // In the handleSubmit function, update the data structure:
const handleSubmit = (e) => {
  e.preventDefault();
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
    if (formData.teamMembers.length >= 5) {
      alert('Maximum 5 team members allowed (excluding yourself)');
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
  const canAddMoreMembers = formData.teamMembers.length < 5;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Student Information</h2>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Please provide your basic details</p>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Primary Student Details */}
        <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {isTeamParticipation ? 'Team Lead Details' : 'Student Details'} *
          </h3>

          {/* single grid wrapper (removed extra nested grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm sm:text-base ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="your.email@college.edu"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="9876543210"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* College */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <School className="w-4 h-4 mr-2" />
                College/University *
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => handleChange('college', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${errors.college ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Your college name"
              />
              {errors.college && <p className="text-red-500 text-sm mt-1">{errors.college}</p>}
            </div>

            {/* Year */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Year of Study *
              </label>
              <select
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${errors.year ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
                <option value="5">Fifth Year</option>
              </select>
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
            </div>

            {/* Roll Number */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 mr-2" />
                Roll Number *
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => handleChange('rollNumber', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${errors.rollNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your roll number"
              />
              {errors.rollNumber && <p className="text-red-500 text-sm mt-1">{errors.rollNumber}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <School className="w-4 h-4 mr-2" />
                Department *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your department"
              />
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            </div>

            {/* Participation Type */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 mr-2" />
                Participation Type *
              </label>
              <div className="relative">
                <select
                  value={formData.participationType}
                  onChange={(e) => handleChange('participationType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 appearance-none pr-10 ${errors.participationType ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {errors.participationType && <p className="text-red-500 text-sm mt-1">{errors.participationType}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {formData.participationType === 'individual' ? 'You will participate individually' : 'You will participate as a team'}
              </p>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        {isTeamParticipation && (
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Members {formData.teamMembers.length > 0 && `(${formData.teamMembers.length}/5)`}
              </h3>
              <button
                type="button"
                onClick={addTeamMember}
                disabled={!canAddMoreMembers}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${canAddMoreMembers ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </button>
            </div>

            {errors.teamMembers && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.teamMembers}</p>
              </div>
            )}

            {/* Always show team members form since we auto-add one member */}
            <div className="space-y-6">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800">Team Member {index + 1}</h4>
                    {/* Don't allow removing the first team member if it's the only one */}
                    {formData.teamMembers.length > 1 && (
                      <button type="button" onClick={() => removeTeamMember(index)} className="text-red-600 hover:text-red-800 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                      <input
                        type="text"
                        value={member.fullName}
                        onChange={(e) => updateTeamMember(index, 'fullName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${errors[`teamMemberName_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Team member full name"
                      />
                      {errors[`teamMemberName_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`teamMemberName_${index}`]}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address *</label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${errors[`teamMemberEmail_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="team.member@college.edu"
                      />
                      {errors[`teamMemberEmail_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`teamMemberEmail_${index}`]}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number *</label>
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => updateTeamMember(index, 'phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${errors[`teamMemberPhone_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="9876543210"
                      />
                      {errors[`teamMemberPhone_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`teamMemberPhone_${index}`]}</p>}
                    </div>

                    {/* College (optional) */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">College/University</label>
                      <input
                        type="text"
                        value={member.college}
                        onChange={(e) => updateTeamMember(index, 'college', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="College name"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help text when only one member exists */}
            {formData.teamMembers.length === 1 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>Tip:</strong> You can add up to 4 more team members using the "Add Team Member" button above.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {isTeamParticipation ? (
              <>Total Team Size: <strong>{formData.teamMembers.length + 1}</strong> (including you)</>
            ) : (
              <>Participation Type: <strong className="capitalize">{formData.participationType}</strong></>
            )}
          </div>
          <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Continue to OTP Verification
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentDetails;