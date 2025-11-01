import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, Tag, RefreshCw, Check } from 'lucide-react';
import { apiRequest } from '../api/client';

const EventSelection = ({ data, updateData, nextStep, prevStep, formData, participationType, teamSize }) => {
  const [selectedEvents, setSelectedEvents] = useState(data?.selectedEvents || []);
  const [selectedEsportsGame, setSelectedEsportsGame] = useState(data?.selectedEsportsGame || '');
  const [includeFood, setIncludeFood] = useState(data?.includeFood ?? true);
  const [includeAccommodation, setIncludeAccommodation] = useState(data?.includeAccommodation ?? false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FIX: Use participationType from props directly
  const currentParticipationType = participationType || formData?.studentDetails?.participationType || 'individual';
  const teamMembersCount = teamSize - 1 || formData?.teamMembers?.length || 0;
  const totalParticipants = currentParticipationType === 'team' ? teamMembersCount + 1 : 1;

  // Check if hackathon is selected
  const isHackathonSelected = selectedEvents.includes('hackathon');
  
  // Check if any free event is selected (events with price 0)
  const hasFreeEvents = selectedEvents.some(eventId => {
    const event = events.find(e => e.id === eventId);
    return event && event.price === 0;
  });
  
  // Food is mandatory for hackathon or free events
  const isFoodMandatory = isHackathonSelected || hasFreeEvents;

  useEffect(() => {
    fetchEvents();
  }, [currentParticipationType]); // Add dependency to refetch when participation type changes

  // Auto-enable food for hackathon and free events, prevent disabling
  useEffect(() => {
    if (isFoodMandatory && !includeFood) {
      setIncludeFood(true);
    }
  }, [isFoodMandatory, selectedEvents]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      // FIX: Pass participation type to API
      const result = await apiRequest(`/api/events?participationType=${currentParticipationType}`);

      if (result.success) {
        setEvents(result.events);
      } else {
        setError(result.message || 'Failed to load events');
        setEvents(getDefaultEvents());
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to connect to server');
      setEvents(getDefaultEvents());
    } finally {
      setLoading(false);
    }
  };

  // Define events based on your requirements
  const getDefaultEvents = () => {
    const teamEvents = [
      {
        id: 'hackathon',
        name: 'Hackathon (Code Forge)',
        description: '36-hour coding competition to build innovative solutions',
        price: 99,
        duration: '36 Hours',
        category: 'Technical',
        type: 'team',
        maxParticipants: 4
      },
      {
        id: 'datathon',
        name: 'Datathon',
        description: 'Data analysis and machine learning competition',
        price: 199,
        duration: '24 Hours',
        category: 'Technical',
        type: 'team',
        maxParticipants: 4
      },
      {
        id: 'polymath',
        name: 'PolyMath (Escape Room)',
        description: 'Solve puzzles and escape the room challenge',
        price: 149,
        duration: '4 Hours',
        category: 'Technical',
        type: 'team',
        maxParticipants: 4
      },
      {
        id: 'esports',
        name: 'E-Sports Tournament',
        description: 'Competitive gaming tournament',
        price: 149,
        duration: '8 Hours',
        category: 'Esports',
        type: 'team',
        maxParticipants: 4,
        requiresGameSelection: true
      },
      {
        id: 'debate',
        name: 'Debate Competition',
        description: 'Argumentation and public speaking challenge',
        price: 99,
        duration: '3 Hours',
        category: 'Cultural',
        type: 'team',
        maxParticipants: 4
      },
      {
        id: 'project-bazaar',
        name: 'Project Bazaar',
        description: 'Showcase your innovative projects',
        price: 0,
        duration: '6 Hours',
        category: 'Technical',
        type: 'team',
        maxParticipants: 4
      },
      {
        id: 'ctf',
        name: 'CTF - Capture The Flag',
        description: 'Cybersecurity challenge with hacking and problem-solving tasks',
        price: 0,
        duration: '6 Hours',
        category: 'Technical',
        type: 'team',
        maxParticipants: 4
      },
      {
        id: 'singing-team',
        name: 'Singing Competition (Team)',
        description: 'Team performance showcasing vocal harmony and talent',
        price: 0,
        duration: '2 Hours',
        category: 'Cultural',
        type: 'team',
        maxParticipants: 4
      },
      {
        id: 'dancing-team',
        name: 'Dancing Competition (Team)',
        description: 'Team choreography and dance performance',
        price: 0,
        duration: '3 Hours',
        category: 'Cultural',
        type: 'team',
        maxParticipants: 4
      },
      {
        id: 'pitch-high',
        name: 'Pitch High',
        description: 'Business pitch competition for innovative ideas',
        price: 99,
        duration: '4 Hours',
        category: 'Business',
        type: 'team',
        maxParticipants: 4
      },
      {
        id: 'two-minute-manager',
        name: 'Two Minute Manager',
        description: 'Quick thinking leadership and management challenge',
        price: 99,
        duration: '1 Hour',
        category: 'Business',
        type: 'team',
        maxParticipants: 4
      }
    ];

    const individualEvents = [
      {
        id: 'retro-theming',
        name: 'Retro Theming',
        description: 'Creative design competition with retro themes',
        price: 99,
        duration: '3 Hours',
        category: 'Creative',
        type: 'individual'
      },
      {
        id: 'prompt-engineering',
        name: 'Prompt Engineering',
        description: 'Master the art of AI prompt crafting',
        price: 99,
        duration: '2 Hours',
        category: 'Technical',
        type: 'individual'
      },
      {
        id: 'integration-bee',
        name: 'Integration Bee',
        description: 'Mathematical integration competition',
        price: 99,
        duration: '3 Hours',
        category: 'Technical',
        type: 'individual'
      },
      {
        id: 'human-vs-ai',
        name: 'Human vs AI',
        description: 'Test your skills against artificial intelligence',
        price: 99,
        duration: '2 Hours',
        category: 'Technical',
        type: 'individual'
      },
      {
        id: 'reverse-engineering',
        name: 'Reverse Engineering',
        description: 'Deconstruct and understand complex systems',
        price: 99,
        duration: '3 Hours',
        category: 'Technical',
        type: 'individual'
      },
      {
        id: 'jack-of-hearts',
        name: 'Jack of Hearts',
        description: 'Card game strategy competition',
        price: 99,
        duration: '2 Hours',
        category: 'Gaming',
        type: 'individual'
      },
      {
        id: 'singing',
        name: 'Singing Competition',
        description: 'Showcase your vocal talent',
        price: 0,
        duration: '2 Hours',
        category: 'Cultural',
        type: 'individual'
      },
      {
        id: 'dancing',
        name: 'Dancing Competition',
        description: 'Show your dance moves and creativity',
        price: 0,
        duration: '3 Hours',
        category: 'Cultural',
        type: 'individual'
      }
    ];

    return currentParticipationType === 'team' ? teamEvents : individualEvents;
  };

  const toggleEventSelection = (eventId) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventId)) {
        // Deselecting an event
        return prev.filter(id => id !== eventId);
      } else {
        // Selecting a new event
        
        // HACKATHON RESTRICTION: If hackathon is being selected, clear all other events
        if (eventId === 'hackathon') {
          if (prev.length > 0) {
            alert('🚫 Hackathon Registration Only!\n\nTeams participating in the Hackathon cannot register for other events.\n\nAll other selections will be cleared.');
          }
          return ['hackathon'];
        }
        
        // HACKATHON RESTRICTION: If hackathon is already selected, prevent adding other events
        if (prev.includes('hackathon')) {
          alert('🚫 Hackathon Teams Only!\n\nYour team is registered for the Hackathon.\n\nYou cannot participate in other events while registered for the Hackathon.\n\nDeselect Hackathon first if you want to choose other events.');
          return prev;
        }
        
        // For esports, ensure only one esports event can be selected
        if (eventId === 'esports') {
          const filtered = prev.filter(id => id !== 'esports');
          return [...filtered, eventId];
        }
        
        return [...prev, eventId];
      }
    });
  };

  const calculateTotalAmount = () => {
    let eventTotal = 0;
    
    selectedEvents.forEach(eventId => {
      const event = events.find(e => e.id === eventId);
      if (event) {
        if (event.type === 'team') {
          eventTotal += event.price * totalParticipants;
        } else {
          eventTotal += event.price;
        }
      }
    });

    const foodTotal = includeFood ? 299 * totalParticipants : 0;
    const accommodationTotal = includeAccommodation ? 299 * totalParticipants : 0;
    
    return eventTotal + foodTotal + accommodationTotal;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedEvents.length === 0) {
      alert('Please select at least one event');
      return;
    }

    // For esports, require game selection
    if (selectedEvents.includes('esports') && !selectedEsportsGame) {
      alert('Please select an E-Sports game');
      return;
    }

    // Validate team size for esports games
    if (selectedEvents.includes('esports') && selectedEsportsGame) {
      const requiredTeamSize = {
        'BGMI': 4,
        'FREEFIRE': 4,
        'VALORANT': 5
      };

      const required = requiredTeamSize[selectedEsportsGame];
      
      if (totalParticipants !== required) {
        alert(
          `❌ Invalid Team Size for ${selectedEsportsGame}\n\n` +
          `${selectedEsportsGame} requires EXACTLY ${required} members.\n\n` +
          `Your current team size: ${totalParticipants}\n` +
          `Required team size: ${required}\n\n` +
          `Please ${totalParticipants < required ? 'add' : 'remove'} ${Math.abs(totalParticipants - required)} member(s) in Step 1 (Student Details).`
        );
        return;
      }
    }

    const selectedEventsData = selectedEvents.map(eventId => 
      events.find(e => e.id === eventId)
    );

    const totalAmount = calculateTotalAmount();

    // FIX: Create proper event selection structure
    updateData({
      eventSelection: {  // ✅ This puts data inside eventSelection object
        selectedEvents: selectedEvents,
        selectedEventsData: selectedEventsData,
        selectedEsportsGame: selectedEsportsGame,
        includeFood: includeFood,
        includeAccommodation: includeAccommodation,
        totalAmount: totalAmount,
        eventCount: selectedEvents.length,
        participantCount: totalParticipants,
        eventName: selectedEventsData.length === 1 ? selectedEventsData[0].name : 'Multiple Events',
        price: totalAmount,
        eventId: selectedEvents.length === 1 ? selectedEvents[0] : 'multiple'
      }
    });

    nextStep();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technical': 'bg-blue-600 text-white',
      'Esports': 'bg-green-600 text-white',
      'Cultural': 'bg-purple-600 text-white',
      'Creative': 'bg-orange-600 text-white',
      'Gaming': 'bg-red-600 text-white'
    };
    return colors[category] || 'bg-gray-600 text-white';
  };

  // FIX: Filter events based on current participation type
  const filteredEvents = events.filter(event => event.type === currentParticipationType);

  const totalAmount = calculateTotalAmount();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-block mb-4 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="text-sm sm:text-base font-black uppercase tracking-wider">Step 3 of 5</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-3">
            🎯 Select Your Events
          </h2>
          <p className="text-gray-600 text-base sm:text-lg font-semibold max-w-2xl mx-auto">
            {currentParticipationType === 'individual' 
              ? 'Choose from our exciting individual competitions' 
              : 'Pick the perfect team challenges for your squad'
            }
          </p>
          
          {/* Participation Type Badge */}
          <div className="mt-6 inline-block">
            <div className={`px-6 py-3 rounded-xl shadow-lg ${
              currentParticipationType === 'team' 
                ? 'bg-purple-600' 
                : 'bg-blue-600'
            } text-white`}>
              <p className="font-black text-base sm:text-lg flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                {currentParticipationType === 'team' 
                  ? <>👥 Team Registration ({totalParticipants} participants)</> 
                  : <>👤 Individual Registration</>
                }
              </p>
            </div>
          </div>
          
          {/* Hackathon Warning Banner */}
          {selectedEvents.includes('hackathon') && (
            <div className="mt-6 p-4 sm:p-5 bg-red-600 text-white rounded-xl shadow-xl border-4 border-red-700 max-w-2xl mx-auto animate-pulse">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl sm:text-4xl">🚫</span>
                <div className="text-left">
                  <p className="font-black text-base sm:text-lg uppercase">Hackathon Teams Only</p>
                  <p className="text-xs sm:text-sm font-semibold mt-1">Your team is exclusively registered for the Hackathon</p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 p-4 bg-yellow-100 rounded-xl flex items-center justify-between border-3 border-yellow-400 shadow-lg max-w-2xl mx-auto">
              <p className="text-yellow-800 font-bold text-sm sm:text-base">{error}</p>
              <button
                onClick={fetchEvents}
                className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-colors flex items-center shadow-md"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Food & Accommodation Package Options - Compact Layout */}
        <div className="mb-4 sm:mb-6">
          {isFoodMandatory && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-orange-100 rounded-lg border-2 border-orange-300">
              <p className="text-orange-900 font-black text-xs sm:text-sm flex items-center">
                <span className="text-lg sm:text-xl mr-2">⚠️</span>
                {isHackathonSelected 
                  ? 'Food Package is MANDATORY for Hackathon participants (36-hour event)'
                  : 'Food Package is MANDATORY for participants in free events'}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Food Package */}
            <div className={`p-4 sm:p-5 rounded-xl shadow-lg border-4 ${
              isFoodMandatory 
                ? 'bg-orange-600 border-orange-700' 
                : 'bg-blue-600 border-blue-700'
            } text-white`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-base sm:text-xl font-black flex items-center">
                  <span className="text-xl sm:text-2xl mr-2">🍽️</span>
                  Food {isFoodMandatory && <span className="ml-2 text-xs bg-yellow-300 text-gray-900 px-2 py-0.5 rounded">Required</span>}
                </h3>
                <label className={`flex items-center ${isFoodMandatory ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={includeFood}
                      onChange={(e) => {
                        if (!isFoodMandatory) {
                          setIncludeFood(e.target.checked);
                        }
                      }}
                      disabled={isFoodMandatory}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors border-3 ${
                      includeFood ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400'
                    }`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform shadow-lg ${
                      includeFood ? 'transform translate-x-6' : ''
                    }`}></div>
                  </div>
                </label>
              </div>
              <p className="text-white text-xs sm:text-sm mb-2">Delicious meals & refreshments for all 3 days</p>
              <p className="text-white text-xs mb-2 opacity-90">Complete food coverage throughout the event</p>
              <div className="bg-white rounded-lg p-2 sm:p-3 inline-block">
                <p className="text-gray-900 text-xs sm:text-sm font-black">
                  {totalParticipants} × ₹299 = <span className="text-orange-600 text-base sm:text-lg">₹{299 * totalParticipants}</span>
                </p>
              </div>
            </div>

            {/* Accommodation Package */}
            <div className="p-4 sm:p-5 bg-purple-600 border-purple-700 rounded-xl shadow-lg border-4 text-white">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-base sm:text-xl font-black flex items-center">
                  <span className="text-xl sm:text-2xl mr-2">🏨</span>
                  Accommodation
                </h3>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={includeAccommodation}
                      onChange={(e) => setIncludeAccommodation(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors border-3 ${
                      includeAccommodation ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400'
                    }`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform shadow-lg ${
                      includeAccommodation ? 'transform translate-x-6' : ''
                    }`}></div>
                  </div>
                </label>
              </div>
              <p className="text-white text-xs sm:text-sm mb-2">Comfortable stay during event</p>
              <div className="bg-white rounded-lg p-2 sm:p-3 inline-block">
                <p className="text-gray-900 text-xs sm:text-sm font-black">
                  {totalParticipants} × ₹299 = <span className="text-purple-600 text-base sm:text-lg">₹{299 * totalParticipants}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* E-Sports Game Selection - Enhanced with Team Size Requirements */}
        {selectedEvents.includes('esports') && (
          <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-green-600 text-white rounded-2xl shadow-xl border-4 border-green-700">
            <h3 className="text-lg sm:text-2xl font-black mb-2 flex items-center">
              <span className="text-xl sm:text-3xl mr-2 sm:mr-3">🎮</span>
              Select Your E-Sports Game
            </h3>
            <p className="text-white font-bold text-xs sm:text-base mb-3 sm:mb-4 drop-shadow">
              ⚠️ Each game has specific team size requirements
            </p>
            
            {/* Team Size Warning for Current Selection */}
            {selectedEsportsGame && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white rounded-lg">
                <p className="text-gray-900 font-black text-xs sm:text-base">
                  <span className="text-lg sm:text-2xl mr-2">👥</span>
                  {selectedEsportsGame === 'VALORANT' 
                    ? `VALORANT requires EXACTLY 5 members` 
                    : `${selectedEsportsGame} requires EXACTLY 4 members`}
                </p>
                <p className={`mt-2 font-bold text-sm ${
                  (selectedEsportsGame === 'VALORANT' && totalParticipants === 5) ||
                  ((selectedEsportsGame === 'BGMI' || selectedEsportsGame === 'FREEFIRE') && totalParticipants === 4)
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  Your current team size: {totalParticipants} members
                  {((selectedEsportsGame === 'VALORANT' && totalParticipants === 5) ||
                    ((selectedEsportsGame === 'BGMI' || selectedEsportsGame === 'FREEFIRE') && totalParticipants === 4))
                    ? ' ✓ Perfect!'
                    : ` ✗ Please ${
                        (selectedEsportsGame === 'VALORANT' && totalParticipants < 5) ||
                        ((selectedEsportsGame === 'BGMI' || selectedEsportsGame === 'FREEFIRE') && totalParticipants < 4)
                          ? 'add'
                          : 'remove'
                      } ${Math.abs(totalParticipants - (selectedEsportsGame === 'VALORANT' ? 5 : 4))} member(s)`}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'BGMI', size: 4 },
                { name: 'FREEFIRE', size: 4 },
                { name: 'VALORANT', size: 5 }
              ].map(game => (
                <button
                  key={game.name}
                  type="button"
                  onClick={() => setSelectedEsportsGame(game.name)}
                  className={`p-4 sm:p-5 rounded-xl text-center transition-all transform hover:scale-105 font-black text-base sm:text-lg border-4 ${
                    selectedEsportsGame === game.name
                      ? 'bg-yellow-400 text-gray-900 border-yellow-500 shadow-2xl scale-105'
                      : 'bg-white text-gray-900 border-white hover:bg-gray-100 shadow-lg'
                  }`}
                >
                  <div className="text-xl sm:text-2xl mb-2">{game.name}</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-600 mb-2">
                    Team Size: {game.size} members
                  </div>
                  {selectedEsportsGame === game.name && (
                    <Check className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mt-2 font-black" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {filteredEvents.map((event) => {
            const isSelected = selectedEvents.includes(event.id);
            const isHackathon = event.id === 'hackathon';
            const hackathonSelected = selectedEvents.includes('hackathon');
            const isDisabled = !isSelected && hackathonSelected && !isHackathon;
            
            // Get category-specific colors
            const categoryColors = {
              'Technical': isSelected ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600',
              'Esports': isSelected ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600',
              'Cultural': isSelected ? 'bg-purple-600' : 'bg-purple-500 hover:bg-purple-600',
              'Creative': isSelected ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600',
              'Gaming': isSelected ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'
            };
            
            const bgColor = categoryColors[event.category] || (isSelected ? 'bg-gray-600' : 'bg-gray-500 hover:bg-gray-600');
            
            return (
              <div
                key={event.id}
                onClick={() => !isDisabled && toggleEventSelection(event.id)}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 transform ${
                  isDisabled 
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-105 hover:shadow-2xl'
                } ${
                  isSelected 
                    ? 'shadow-2xl ring-4 ring-yellow-400 scale-105' 
                    : 'shadow-lg'
                }`}
              >
                {/* Card Header with Solid Color */}
                <div className={`${bgColor} text-white p-4 sm:p-6 relative overflow-hidden transition-colors duration-300`}>
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full -ml-12 -mb-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <h3 className="text-lg sm:text-2xl font-black pr-2 sm:pr-4 leading-tight drop-shadow-lg">{event.name}</h3>
                      {isSelected && (
                        <div className="bg-yellow-400 text-gray-900 rounded-full p-1.5 sm:p-2 shadow-lg animate-bounce flex-shrink-0">
                          <Check className="w-4 h-4 sm:w-6 sm:h-6 font-black" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    
                    {/* Category Badge - Enhanced Visibility */}
                    <span className="inline-block bg-gray-900 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs font-black uppercase tracking-wider border-2 border-white shadow-lg">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Card Body with White Background */}
                <div className="bg-white p-4 sm:p-6">
                  <p className="text-gray-700 mb-5 text-sm sm:text-base leading-relaxed font-medium min-h-[60px]">
                    {event.description}
                  </p>
                  
                  {/* Event Details Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <div className="flex items-center text-gray-700">
                        <div className="bg-blue-600 p-2 rounded-lg mr-3">
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm sm:text-base font-semibold">Registration Fee</span>
                      </div>
                      <span className="text-base sm:text-lg font-black text-blue-600">
                        {event.price === 0 ? 'FREE' : `₹${event.price}${event.type === 'team' ? '/person' : ''}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <div className="flex items-center text-gray-700">
                        <div className="bg-purple-600 p-2 rounded-lg mr-3">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm sm:text-base font-semibold">
                          {event.type === 'team' ? 'Team Size' : 'Type'}
                        </span>
                      </div>
                      <span className="text-base sm:text-lg font-black text-purple-600">
                        {event.type === 'team' ? `${event.maxParticipants} members` : 'Individual'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <div className="flex items-center text-gray-700">
                        <div className="bg-orange-600 p-2 rounded-lg mr-3">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm sm:text-base font-semibold">Duration</span>
                      </div>
                      <span className="text-base sm:text-lg font-black text-orange-600">{event.duration}</span>
                    </div>
                    
                    {event.requiresGameSelection && (
                      <div className="p-3 bg-yellow-50 rounded-xl border-2 border-yellow-300">
                        <div className="flex items-center text-yellow-800">
                          <Tag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={2.5} />
                          <span className="text-xs sm:text-sm font-bold">Game selection required</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selection Status - Enhanced Visibility */}
                  {isSelected && (
                    <div className="mt-4 p-4 bg-green-600 text-white rounded-xl shadow-lg border-2 border-green-700">
                      <p className="text-base sm:text-lg font-black flex items-center justify-center drop-shadow-lg">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 mr-2" strokeWidth={3} />
                        ✓ SELECTED
                        {event.type === 'team' && (
                          <span className="ml-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm sm:text-base font-black shadow-md">
                            ₹{event.price * totalParticipants} total
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  
                  {/* Hackathon Warning */}
                  {isDisabled && (
                    <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-xl border-2 border-red-300">
                      <p className="text-xs sm:text-sm font-bold text-center">
                        🚫 Unavailable - Hackathon teams only
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary - Enhanced with Detailed Pricing */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl border-4 border-gray-300">
          <div className="flex items-center mb-6">
            <div className="bg-purple-600 p-3 rounded-xl mr-4">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">Order Summary</h3>
          </div>
          
          <div className="space-y-4">
            {/* Participation Info */}
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <span className="text-gray-700 font-bold text-sm sm:text-base">Participation Type:</span>
              <span className="font-black text-blue-600 capitalize text-base sm:text-lg">{currentParticipationType}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <span className="text-gray-700 font-bold text-sm sm:text-base">Total Participants:</span>
              <span className="font-black text-purple-600 text-base sm:text-lg">{totalParticipants} {currentParticipationType === 'team' ? 'members' : 'person'}</span>
            </div>
            
            {/* Events Breakdown Section */}
            {selectedEvents.length > 0 && (
              <div className="border-2 border-green-300 rounded-xl p-4 bg-green-50">
                <h4 className="font-black text-green-800 mb-3 text-base sm:text-lg flex items-center">
                  <span className="text-xl mr-2">🎯</span>
                  Selected Events ({selectedEvents.length})
                </h4>
                <div className="space-y-2">
                  {selectedEvents.map(eventId => {
                    const event = events.find(e => e.id === eventId);
                    if (!event) return null;
                    
                    const eventPrice = event.type === 'team' ? event.price * totalParticipants : event.price;
                    const priceBreakdown = event.type === 'team' 
                      ? `₹${event.price} × ${totalParticipants} participants`
                      : `₹${event.price}`;
                    
                    return (
                      <div key={eventId} className="bg-white p-3 rounded-lg border-2 border-green-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm sm:text-base">{event.name}</p>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1">{priceBreakdown}</p>
                          </div>
                          <span className="font-black text-green-600 text-base sm:text-lg ml-3">₹{eventPrice}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* E-Sports Game Info */}
            {selectedEvents.includes('esports') && selectedEsportsGame && (
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <span className="text-gray-700 font-bold text-sm sm:text-base flex items-center">
                  <span className="text-xl mr-2">🎮</span>
                  E-Sports Game:
                </span>
                <span className="font-black text-orange-600 text-base sm:text-lg">{selectedEsportsGame}</span>
              </div>
            )}
            
            {/* Food Package Breakdown */}
            {includeFood && (
              <div className="border-2 border-yellow-300 rounded-xl p-4 bg-yellow-50">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-gray-700 font-bold text-sm sm:text-base flex items-center">
                      <span className="text-xl mr-2">🍽️</span>
                      Food Package
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">₹299 × {totalParticipants} participants</p>
                  </div>
                  <span className="font-black text-yellow-600 text-base sm:text-lg">₹{299 * totalParticipants}</span>
                </div>
              </div>
            )}
            
            {/* Accommodation Package Breakdown */}
            {includeAccommodation && (
              <div className="border-2 border-purple-300 rounded-xl p-4 bg-purple-50">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-gray-700 font-bold text-sm sm:text-base flex items-center">
                      <span className="text-xl mr-2">🏨</span>
                      Accommodation Package
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">₹299 × {totalParticipants} participants</p>
                  </div>
                  <span className="font-black text-purple-600 text-base sm:text-lg">₹{299 * totalParticipants}</span>
                </div>
              </div>
            )}
            
            {/* Subtotal */}
            {selectedEvents.length > 0 && (
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                  <span className="text-gray-700 font-bold text-sm sm:text-base">Events Subtotal:</span>
                  <span className="font-black text-gray-900 text-base sm:text-lg">
                    ₹{selectedEvents.reduce((total, eventId) => {
                      const event = events.find(e => e.id === eventId);
                      if (!event) return total;
                      return total + (event.type === 'team' ? event.price * totalParticipants : event.price);
                    }, 0)}
                  </span>
                </div>
              </div>
            )}
            
            {/* Grand Total */}
            <div className="border-t-4 border-gray-300 pt-5 mt-5">
              <div className="flex justify-between items-center p-5 bg-blue-600 rounded-xl shadow-lg">
                <div>
                  <span className="text-white font-black text-lg sm:text-xl block">Grand Total</span>
                  <span className="text-blue-200 text-xs sm:text-sm font-semibold">
                    {selectedEvents.length} {selectedEvents.length === 1 ? 'event' : 'events'} 
                    {includeFood ? ' + Food' : ''}
                    {includeAccommodation ? ' + Accommodation' : ''}
                  </span>
                </div>
                <span className="text-yellow-300 font-black text-2xl sm:text-3xl">₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t-4 border-gray-300">
          <button
            type="button"
            onClick={prevStep}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 font-black shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base sm:text-lg"
          >
            ← Back
          </button>
          
          <div className="text-center bg-yellow-400 px-6 py-4 rounded-xl shadow-lg border-4 border-yellow-500">
            <div className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center justify-center gap-2">
              💰 ₹{totalAmount}
            </div>
            <div className="text-xs sm:text-sm text-gray-700 font-black uppercase tracking-wider mt-1">Total Amount</div>
          </div>

          <button
            type="submit"
            disabled={selectedEvents.length === 0}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 font-black shadow-lg transform text-base sm:text-lg flex items-center justify-center gap-2 ${
              selectedEvents.length > 0
                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Payment →
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default EventSelection;