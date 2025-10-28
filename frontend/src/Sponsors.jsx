import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const SponsorsPage = () => {
  const containerRef = useRef(null);
  const [activeTier, setActiveTier] = useState('all');
  const [selectedSponsor, setSelectedSponsor] = useState(null);

   // Handle become sponsor email
  const handleBecomeSponsor = () => {
    const subject = 'Sponsorship Inquiry - CHAITANYA 2025';
    const body = `Hello CHAITANYA Team,

I am interested in becoming a sponsor for CHAITANYA 2025. Please provide me with more information about sponsorship opportunities.

Best regards,
Contact Number:  [your contact]`;

    
    window.location.href = `mailto:chaitanyahptu@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Sample sponsor data - can be replaced later
  const sponsors = {
    platinum: [
      {
        id: 1,
        name: "Tech Giant Inc.",
        tier: "platinum",
        description: "Leading technology company driving innovation in AI and cloud computing.",
        website: "https://techgiant.com",
        logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        contribution: "Title Sponsor & Technology Partner",
        benefits: "Main stage branding, keynote speaking slot, exclusive workshops",
        color: "from-gray-100 to-gray-300",
        since: "2022"
      },
      {
        id: 2,
        name: "Innovate Labs",
        tier: "platinum",
        description: "Pioneering research and development in emerging technologies.",
        website: "https://innovatelabs.com",
        logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        contribution: "Innovation Partner",
        benefits: "Research showcase, tech demo area, recruitment booth",
        color: "from-blue-100 to-cyan-200",
        since: "2023"
      }
    ],
    gold: [
      {
        id: 3,
        name: "Cloud Systems",
        tier: "gold",
        description: "Enterprise cloud solutions and infrastructure services.",
        website: "https://cloudsystems.com",
        logo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        contribution: "Cloud Infrastructure Partner",
        benefits: "Workshop sponsorship, branded swag, social media features",
        color: "from-yellow-100 to-amber-200",
        since: "2024"
      },
      {
        id: 4,
        name: "Data Dynamics",
        tier: "gold",
        description: "Big data analytics and machine learning solutions provider.",
        website: "https://datadynamics.ai",
        logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        contribution: "Data Science Partner",
        benefits: "Hackathon challenge sponsor, technical sessions, networking events",
        color: "from-green-100 to-emerald-200",
        since: "2023"
      },
      {
        id: 5,
        name: "Code Masters",
        tier: "gold",
        description: "Software development tools and educational platforms.",
        website: "https://codemasters.dev",
        logo: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        contribution: "Developer Tools Partner",
        benefits: "Toolkit distribution, coding workshops, developer relations",
        color: "from-purple-100 to-pink-200",
        since: "2024"
      }
    ],
    silver: [
      {
        id: 6,
        name: "StartUp Hub",
        tier: "silver",
        description: "Incubator and accelerator for tech startups.",
        website: "https://startuphub.com",
        logo: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        contribution: "Startup Ecosystem Partner",
        benefits: "Startup pitch session, mentorship programs, networking",
        color: "from-slate-100 to-slate-300",
        since: "2024"
      },
      {
        id: 7,
        name: "Design Studio",
        tier: "silver",
        description: "Creative agency specializing in UI/UX design.",
        website: "https://designstudio.com",
        logo: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        contribution: "Design Partner",
        benefits: "Design workshops, portfolio reviews, creative sessions",
        color: "from-orange-100 to-red-200",
        since: "2023"
      },
      {
        id: 8,
        name: "EduTech Solutions",
        tier: "silver",
        description: "Online learning platforms and educational technology.",
        website: "https://edutechsolutions.com",
        logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        contribution: "Education Partner",
        benefits: "Learning resources, scholarship opportunities, webinars",
        color: "from-teal-100 to-cyan-200",
        since: "2024"
      }
    ],
    community: [
      {
        id: 9,
        name: "Local Tech Community",
        tier: "community",
        description: "Regional technology enthusiasts and professionals network.",
        website: "https://localtech.com",
        logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        contribution: "Community Partner",
        benefits: "Community outreach, volunteer coordination, local promotion",
        color: "from-indigo-100 to-blue-200",
        since: "2022"
      },
      {
        id: 10,
        name: "Campus Coding Club",
        tier: "community",
        description: "Student-led programming and development community.",
        website: "https://campuscode.org",
        logo: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        contribution: "Student Partner",
        benefits: "Student engagement, campus promotion, event volunteers",
        color: "from-violet-100 to-purple-200",
        since: "2023"
      }
    ]
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(".hero-title", 
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power3.out"
        }
      );

      // Tier filter animation
      gsap.fromTo(".tier-filter",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.5
        }
      );

      // Sponsor cards animation
      gsap.fromTo(".sponsor-card",
        { opacity: 0, y: 80, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".sponsors-grid",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Stats counter animation
      gsap.fromTo(".sponsor-stat",
        { innerText: 0 },
        {
          innerText: (i, target) => {
            const values = [9, 2, 3, 3, 2];
            return values[i];
          },
          duration: 2,
          snap: { innerText: 1 },
          stagger: 0.3,
          scrollTrigger: {
            trigger: ".stats-section",
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Filter sponsors based on active tier
  const filteredSponsors = activeTier === 'all' 
    ? [...sponsors.platinum, ...sponsors.gold, ...sponsors.silver, ...sponsors.community]
    : sponsors[activeTier] || [];

  const handleTierChange = (tierId) => {
    setActiveTier(tierId);
    
    // Animate tier change
    gsap.to(".sponsor-card", {
      opacity: 0,
      y: 50,
      duration: 0.3,
      onComplete: () => {
        setTimeout(() => {
          gsap.fromTo(".sponsor-card",
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "back.out(1.7)"
            }
          );
        }, 50);
      }
    });
  };

  const openSponsorModal = (sponsor) => {
    setSelectedSponsor(sponsor);
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      gsap.to(".sponsor-modal", {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
      });
    }, 10);
  };

  const closeSponsorModal = () => {
    gsap.to(".sponsor-modal", {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setSelectedSponsor(null);
        document.body.style.overflow = 'auto';
      }
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSponsorModal();
    }
  };

  const tiers = [
    { 
      id: 'all', 
      label: 'All Sponsors', 
      color: 'from-cyan-500 to-blue-500',
      count: filteredSponsors.length
    },
    { 
      id: 'platinum', 
      label: 'Platinum', 
      color: 'from-gray-400 to-gray-600',
      count: sponsors.platinum.length,
      icon: '💎'
    },
    { 
      id: 'gold', 
      label: 'Gold', 
      color: 'from-yellow-500 to-amber-500',
      count: sponsors.gold.length,
      icon: '🥇'
    },
    { 
      id: 'silver', 
      label: 'Silver', 
      color: 'from-slate-400 to-slate-600',
      count: sponsors.silver.length,
      icon: '🥈'
    },
    { 
      id: 'community', 
      label: 'Community', 
      color: 'from-green-500 to-emerald-500',
      count: sponsors.community.length,
      icon: '🤝'
    }
  ];

  const getTierColor = (tier) => {
    switch(tier) {
      case 'platinum': return 'from-gray-500 to-gray-700';
      case 'gold': return 'from-yellow-500 to-amber-600';
      case 'silver': return 'from-slate-500 to-slate-700';
      case 'community': return 'from-green-500 to-emerald-600';
      default: return 'from-cyan-500 to-blue-500';
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="relative z-50 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-white font-mono text-xl font-bold group-hover:text-cyan-400 transition-colors">
              CHAITANYA
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-cyan-400 transition-colors font-medium">
              Home
            </Link>
            <Link to="/about" className="text-white hover:text-cyan-400 transition-colors font-medium">
              About
            </Link>
            <Link to="/events" className="text-white hover:text-cyan-400 transition-colors font-medium">
              Events
            </Link>
            <span className="text-cyan-400 font-medium border-b-2 border-cyan-400">Sponsors</span>
            <a href="/contact" className="text-white hover:text-cyan-400 transition-colors font-medium">
              Contact
            </a>
          </div>

          <button 
            onClick={handleBecomeSponsor}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105"
          >
            Become a Sponsor
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="hero-title text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 opacity-0">
            SPONSORS
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto px-4">
            Meet the visionary organizations powering innovation and driving the future of technology at CHAITANYA 2025
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section relative py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-8">
            {[
              { number: 9, label: "Total Sponsors" },
              { number: 2, label: "Platinum Partners" },
              { number: 3, label: "Gold Partners" },
              { number: 3, label: "Silver Partners" },
              { number: 2, label: "Community Partners" }
            ].map((stat, index) => (
              <div key={index} className="text-center bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-gray-700/50">
                <div className="sponsor-stat text-2xl sm:text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
                  0
                </div>
                <div className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier Filter */}
      <section className="relative py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => handleTierChange(tier.id)}
                className={`tier-filter px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold transition-all transform hover:scale-105 relative text-sm sm:text-base ${
                  activeTier === tier.id 
                    ? `bg-gradient-to-r ${tier.color} text-white shadow-2xl` 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span className="flex items-center space-x-2">
                  {tier.icon && <span>{tier.icon}</span>}
                  <span>{tier.label}</span>
                </span>
                <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                  {tier.count}
                </span>
              </button>
            ))}
          </div>

          {/* Active Tier Display */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {tiers.find(tier => tier.id === activeTier)?.label} 
              <span className="text-cyan-400 ml-2">({filteredSponsors.length} sponsors)</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              {activeTier === 'all' 
                ? 'Showing all our amazing sponsors' 
                : `Showing ${activeTier} tier sponsors`
              }
            </p>
          </div>

          {/* Sponsors Grid */}
          <div className="sponsors-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="sponsor-card group cursor-pointer opacity-0"
                onClick={() => openSponsorModal(sponsor)}
              >
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-lg border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-500 h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-transparent z-10" />
                  
                  {/* Tier Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getTierColor(sponsor.tier)} text-white capitalize`}>
                      {sponsor.tier}
                    </span>
                  </div>

                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  </div>
                  
                  <div className="relative z-20 p-4 sm:p-6 flex-1 flex flex-col">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {sponsor.name}
                    </h3>
                    <p className="text-cyan-400 text-xs sm:text-sm mb-3 italic">{sponsor.contribution}</p>
                    <p className="text-gray-300 text-xs sm:text-sm mb-4 line-clamp-2 flex-1">{sponsor.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-gray-400 text-xs">
                        Since {sponsor.since}
                      </span>
                      <button className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm sm:text-base">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSponsors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl">No sponsors found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-lg rounded-3xl p-8 sm:p-12 border border-cyan-500/30">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Want to Join Our <span className="text-cyan-400">Sponsor</span> Family?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Partner with us to reach thousands of tech enthusiasts, students, and professionals. 
            Let's build the future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleBecomeSponsor}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105"
            >
              Become a Sponsor
            </button>
            <button className="border-2 border-cyan-500 text-cyan-400 px-8 py-4 rounded-xl text-lg font-bold hover:bg-cyan-500 hover:text-white transition-all">
              Download Brochure
            </button>
          </div>
        </div>
      </section>

      {/* Sponsor Modal */}
      {selectedSponsor && (
        <div 
          className="sponsor-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm opacity-0 scale-90"
          onClick={handleBackdropClick}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl border border-cyan-500/30">
            <button
              onClick={closeSponsorModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 bg-gray-800 rounded-full p-1"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative h-48 sm:h-64 overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
              <img
                src={selectedSponsor.logo}
                alt={selectedSponsor.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
                <span className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getTierColor(selectedSponsor.tier)} text-white mb-2 inline-block capitalize`}>
                  {selectedSponsor.tier} Sponsor
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-white">{selectedSponsor.name}</h2>
                <p className="text-cyan-400 text-sm sm:text-lg italic">{selectedSponsor.contribution}</p>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">About Sponsor</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{selectedSponsor.description}</p>
                  
                  <div className="mt-6 space-y-3 text-gray-300 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span>Partnership Since:</span>
                      <span className="text-cyan-400">{selectedSponsor.since}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tier:</span>
                      <span className="text-cyan-400 capitalize">{selectedSponsor.tier}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Sponsorship Benefits</h3>
                  <p className="text-gray-300 text-sm sm:text-base">{selectedSponsor.benefits}</p>
                  
                  <div className="mt-6">
                    <a 
                      href={selectedSponsor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Visit Website</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 sm:py-4 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-600 transition-all text-sm sm:text-base">
                  Contact Sponsor
                </button>
                <button className="flex-1 border-2 border-cyan-500 text-cyan-400 py-3 sm:py-4 rounded-xl font-bold hover:bg-cyan-500 hover:text-white transition-all text-sm sm:text-base">
                  Similar Sponsors
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative py-8 sm:py-12 px-4 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center space-x-4 sm:space-x-8 mb-6 sm:mb-8 flex-wrap">
            {['Partnership', 'Contact', 'Brochure', 'Terms'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-400 hover:text-cyan-400 transition-colors text-sm sm:text-base mb-2"
              >
                {item}
              </a>
            ))}
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            © 2025 CHAITANYA Tech Fest. Partner with us to shape the future of technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SponsorsPage;