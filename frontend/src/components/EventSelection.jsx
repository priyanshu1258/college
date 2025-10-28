import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, Tag, RefreshCw, Check } from 'lucide-react';
import { apiRequest } from '../api/client';

const EventSelection = ({ data, updateData, nextStep, prevStep, formData, participationType, teamSize }) => {
  const [selectedEvents, setSelectedEvents] = useState(data?.selectedEvents || []);
  const [selectedEsportsGame, setSelectedEsportsGame] = useState(data?.selectedEsportsGame || '');
  const [includeFood, setIncludeFood] = useState(data?.includeFood ?? true);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FIX: Use participationType from props directly
  const currentParticipationType = participationType || formData?.studentDetails?.participationType || 'individual';
  const teamMembersCount = teamSize - 1 || formData?.teamMembers?.length || 0;
  const totalParticipants = currentParticipationType === 'team' ? teamMembersCount + 1 : 1;

  useEffect(() => {
    fetchEvents();
  }, [currentParticipationType]); // Add dependency to refetch when participation type changes

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
        price: 199,
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
        duration: '1 Day',
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
        maxParticipants: 2
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
        price: 99,
        duration: '2 Hours',
        category: 'Cultural',
        type: 'individual'
      },
      {
        id: 'dancing',
        name: 'Dancing Competition',
        description: 'Show your dance moves and creativity',
        price: 99,
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
        return prev.filter(id => id !== eventId);
      } else {
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

    const foodTotal = includeFood ? 199 * totalParticipants : 0;
    
    return eventTotal + foodTotal;
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
      'Technical': 'bg-blue-100 text-blue-800',
      'Esports': 'bg-green-100 text-green-800',
      'Cultural': 'bg-purple-100 text-purple-800',
      'Creative': 'bg-orange-100 text-orange-800',
      'Gaming': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Select Your Events</h2>
        <p className="text-gray-600">
          {currentParticipationType === 'individual' 
            ? 'Choose individual events to participate in' 
            : 'Choose team events for your team'
          }
        </p>
        
        {/* Show participation type info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg inline-block">
          <p className="text-blue-700 font-semibold">
            {currentParticipationType === 'team' 
              ? `Team Registration (${totalParticipants} participants)` 
              : 'Individual Registration'
            }
          </p>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex items-center justify-between">
            <p className="text-yellow-700 text-sm">{error}</p>
            <button
              onClick={fetchEvents}
              className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Food Package Option */}
      <div className="mb-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-1">Food Package</h3>
            <p className="text-blue-700 text-sm">
              Includes meals and refreshments during the event (₹199 per person)
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Total participants: {totalParticipants} × ₹199 = ₹{199 * totalParticipants}
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={includeFood}
                onChange={(e) => setIncludeFood(e.target.checked)}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${
                includeFood ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                includeFood ? 'transform translate-x-6' : ''
              }`}></div>
            </div>
            <span className="ml-3 text-gray-700 font-medium">
              {includeFood ? 'Included' : 'Add Food'}
            </span>
          </label>
        </div>
      </div>

      {/* E-Sports Game Selection */}
      {selectedEvents.includes('esports') && (
        <div className="mb-6 p-6 bg-green-50 rounded-xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Select E-Sports Game</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['BGMI', 'FREEFIRE', 'VALORANT'].map(game => (
              <button
                key={game}
                type="button"
                onClick={() => setSelectedEsportsGame(game)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  selectedEsportsGame === game
                    ? 'border-green-500 bg-green-100 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold text-gray-800">{game}</span>
                {selectedEsportsGame === game && (
                  <Check className="w-5 h-5 text-green-600 mx-auto mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => toggleEventSelection(event.id)}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedEvents.includes(event.id)
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">{event.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Registration Fee: <strong className="text-gray-800 ml-1">
                    {event.price === 0 ? 'Free' : `₹${event.price}${event.type === 'team' ? '/person' : ''}`}
                  </strong>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  {event.type === 'team' ? (
                    <span>Team Size: <strong className="text-gray-800 ml-1">{event.maxParticipants} members</strong></span>
                  ) : (
                    <span>Type: <strong className="text-gray-800 ml-1">Individual</strong></span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  Duration: <strong className="text-gray-800 ml-1">{event.duration}</strong>
                </div>
                {event.requiresGameSelection && (
                  <div className="flex items-center text-sm text-yellow-600">
                    <Tag className="w-4 h-4 mr-2" />
                    Requires game selection
                  </div>
                )}
              </div>

              {selectedEvents.includes(event.id) && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700 font-semibold flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    Selected ✓
                    {event.type === 'team' && (
                      <span className="ml-2 text-blue-600">
                        (₹{event.price * totalParticipants} for team)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Participation Type:</span>
              <span className="font-semibold text-gray-800 capitalize">{currentParticipationType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Participants:</span>
              <span className="font-semibold text-gray-800">{totalParticipants}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Events Selected:</span>
              <span className="font-semibold text-gray-800">{selectedEvents.length}</span>
            </div>
            {selectedEvents.includes('esports') && selectedEsportsGame && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">E-Sports Game:</span>
                <span className="font-semibold text-gray-800">{selectedEsportsGame}</span>
              </div>
            )}
            {includeFood && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Food Package:</span>
                <span className="font-semibold text-gray-800">₹{199 * totalParticipants}</span>
              </div>
            )}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back
          </button>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">₹{totalAmount}</div>
            <div className="text-sm text-gray-600">Total Amount</div>
          </div>

          <button
            type="submit"
            disabled={selectedEvents.length === 0}
            className={`px-6 py-3 rounded-lg transition-colors font-semibold ${
              selectedEvents.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventSelection;