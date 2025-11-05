import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useNavigate } from 'react-router-dom';

// Import images
import img1 from './assets/IMG-20251029-WA0006.jpg';
import img2 from './assets/IMG-20251029-WA0007.jpg';
import img3 from './assets/IMG-20251029-WA0008.jpg';
import img4 from './assets/IMG-20251029-WA0009.jpg';
import img5 from './assets/IMG-20251029-WA0010.jpg';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const navigationRef = useRef(null);
  const particlesRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animations
      gsap.fromTo(".hero-title", 
        { opacity: 0, y: 100, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: "power3.out",
          delay: 0.5
        }
      );

      gsap.fromTo(".hero-subtitle",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          delay: 1
        }
      );

      gsap.fromTo(".hero-cta",
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 1.5
        }
      );

      // Floating particles animation
      gsap.to(".floating-particle", {
        y: -30,
        x: "random(-20, 20)",
        rotation: "random(-180, 180)",
        duration: "random(3, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2
      });

      // Navigation animation
      gsap.fromTo(".nav-item",
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.2
        }
      );

      // Section animations with ScrollTrigger
      gsap.fromTo(".feature-card",
        { opacity: 0, y: 80, rotationX: 45 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".features-section",
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo(".event-card",
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".events-section",
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Gallery morphing animation - smooth morphing transition with images coming to center
      // All images morph from small scale to full size at center with staggered timing
      const galleryTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".gallery-section",
          start: "top 60%",
          toggleActions: "play none none reverse"
        }
      });

      galleryTimeline
        .fromTo(".gallery-img-1",
          { scale: 0, opacity: 0, x: -800, y: -600 },
          { scale: 1, opacity: 1, x: 0, y: 0, duration: 2, ease: "power1.inOut" }
        )
        .fromTo(".gallery-img-2",
          { scale: 0, opacity: 0, x: 800, y: -600 },
          { scale: 1, opacity: 1, x: 0, y: 0, duration: 2, ease: "power1.inOut" },
          "-=1.6"
        )
        .fromTo(".gallery-img-3",
          { scale: 0, opacity: 0, y: 800 },
          { scale: 1, opacity: 1, y: 0, duration: 2, ease: "power1.inOut" },
          "-=1.6"
        )
        .fromTo(".gallery-img-4",
          { scale: 0, opacity: 0, x: -800, y: 600 },
          { scale: 1, opacity: 1, x: 0, y: 0, duration: 2, ease: "power1.inOut" },
          "-=1.6"
        )
        .fromTo(".gallery-img-5",
          { scale: 0, opacity: 0, x: 800, y: 600 },
          { scale: 1, opacity: 1, x: 0, y: 0, duration: 2, ease: "power1.inOut" },
          "-=1.6"
        );

      // Background Image Morphing Animation
      const bgTimeline = gsap.timeline({ repeat: -1 });
      bgTimeline
        .to(".bg-img-1", { opacity: 1, duration: 0, ease: "none" })
        .to(".bg-img-1", { scale: 1.1, duration: 4, ease: "power1.inOut" })
        .to(".bg-img-1", { opacity: 0, duration: 1.5, ease: "power1.inOut" })
        .to(".bg-img-2", { opacity: 1, duration: 1.5, ease: "power1.inOut" }, "-=1.5")
        .to(".bg-img-2", { scale: 1.1, duration: 4, ease: "power1.inOut" })
        .to(".bg-img-2", { opacity: 0, duration: 1.5, ease: "power1.inOut" })
        .to(".bg-img-3", { opacity: 1, duration: 1.5, ease: "power1.inOut" }, "-=1.5")
        .to(".bg-img-3", { scale: 1.1, duration: 4, ease: "power1.inOut" })
        .to(".bg-img-3", { opacity: 0, duration: 1.5, ease: "power1.inOut" })
        .to(".bg-img-4", { opacity: 1, duration: 1.5, ease: "power1.inOut" }, "-=1.5")
        .to(".bg-img-4", { scale: 1.1, duration: 4, ease: "power1.inOut" })
        .to(".bg-img-4", { opacity: 0, duration: 1.5, ease: "power1.inOut" })
        .to(".bg-img-5", { opacity: 1, duration: 1.5, ease: "power1.inOut" }, "-=1.5")
        .to(".bg-img-5", { scale: 1.1, duration: 4, ease: "power1.inOut" })
        .to(".bg-img-5", { opacity: 0, duration: 1.5, ease: "power1.inOut" })
        .to(".bg-img-1", { opacity: 1, scale: 1, duration: 1.5, ease: "power1.inOut" }, "-=1.5");

      // Parallax effects
      gsap.to(".parallax-bg", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      gsap.to(".parallax-element", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      // Counter animation
      gsap.fromTo(".count-number",
        { innerText: 0 },
        {
          innerText: (i, target) => {
            const values = [500, 20, 10, 5];
            return values[i];
          },
          duration: 2,
          snap: { innerText: 1 },
          stagger: 0.5,
          scrollTrigger: {
            trigger: ".stats-section",
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Interactive hover effects
      const setupHoverEffects = () => {
        // Feature cards hover
        gsap.utils.toArray(".feature-card").forEach((card) => {
          card.addEventListener("mouseenter", () => {
            gsap.to(card, {
              y: -10,
              scale: 1.02,
              duration: 0.3,
              ease: "power2.out"
            });
          });
          card.addEventListener("mouseleave", () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          });
        });

        // Event cards hover
        gsap.utils.toArray(".event-card").forEach((card) => {
          card.addEventListener("mouseenter", () => {
            gsap.to(card.querySelector(".event-icon"), {
              rotation: 360,
              duration: 0.6,
              ease: "power2.out"
            });
          });
        });

        // Navigation hover
        gsap.utils.toArray(".nav-item").forEach((item) => {
          item.addEventListener("mouseenter", () => {
            gsap.to(item, {
              scale: 1.1,
              color: "#9ca3af",
              duration: 0.2,
              ease: "power2.out"
            });
          });
          item.addEventListener("mouseleave", () => {
            gsap.to(item, {
              scale: 1,
              color: "#ffffff",
              duration: 0.2,
              ease: "power2.out"
            });
          });
        });
      };

      setupHoverEffects();

      // Glitch effect on hero title
      const glitchEffect = () => {
        gsap.to(".hero-title", {
          x: "random(-5, 5)",
          y: "random(-2, 2)",
          color: "random(['#6b7280', '#9ca3af', '#d1d5db'])",
          duration: 0.05,
          repeat: 3,
          yoyo: true,
          onComplete: () => {
            gsap.to(".hero-title", {
              x: 0,
              y: 0,
              color: "#ffffff",
              duration: 0.1
            });
          }
        });
      };

      // Random glitch every 5 seconds
      setInterval(glitchEffect, 5000);
    });

    return () => ctx.revert();
  }, []);

  // Button handlers
  const handleExploreEvents = () => {
    navigate('/events');
  };

  const handleRegisterNow = () => {
    navigate('/PaymentFlow');
  };

  const features = [
    {
      icon: "🤖",
      title: "AI & Robotics",
      description: "Cutting-edge AI workshops and robotics competitions"
    },
    {
      icon: "💻",
      title: "Hackathon",
      description: "48-hour coding marathon with exciting prizes"
    },
    {
      icon: "🎮",
      title: "Gaming Arena",
      description: "Esports tournaments and VR experiences"
    },
    {
      icon: "🔬",
      title: "Tech Expo",
      description: "Showcase of innovative projects and research"
    }
  ];

  const events = [
    {
      name: "Code Wars",
      type: "Competition",
      date: "November 6",
      participants: "200+",
      icon: "⚔️"
    },
    {
      name: "Tech Talks",
      type: "Workshop",
      date: "November 7",
      participants: "500+",
      icon: "🎤"
    },
    {
      name: "Innovation Fair",
      type: "Exhibition",
      date: "November 8",
      participants: "1000+",
      icon: "🏆"
    },
    {
      name: "Startup Pitch",
      type: "Competition",
      date: "November 8",
      participants: "50+",
      icon: "🚀"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-x-hidden">
      {/* Animated Background with Morphing Images */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {/* Background Image Slideshow with Morph Effect */}
        <div className="bg-morph-container absolute inset-0">
          <div className="bg-img-1 absolute inset-0 opacity-0">
            <img src={img1} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
          <div className="bg-img-2 absolute inset-0 opacity-0">
            <img src={img2} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
          <div className="bg-img-3 absolute inset-0 opacity-0">
            <img src={img3} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
          <div className="bg-img-4 absolute inset-0 opacity-0">
            <img src={img4} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
          <div className="bg-img-5 absolute inset-0 opacity-0">
            <img src={img5} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
        </div>
        <div className="parallax-bg absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-orange-900/10 to-red-900/10" />
        <div className="parallax-element absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="parallax-element absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        
        {/* Floating Particles */}
        <div ref={particlesRef} className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="floating-particle absolute w-2 h-2 bg-gray-400 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navigationRef} className="relative z-50 py-4 sm:py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-4 group">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full" />
            <span className="text-white font-mono text-lg sm:text-xl font-bold">CHAITANYA</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {['Home', 'About', 'Events', 'Sponsors', 'Contact'].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="nav-item text-white hover:text-gray-300 transition-colors font-medium opacity-0 text-sm lg:text-base"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-gray-800 z-50 flex flex-col items-center py-4 space-y-4">
              {['Home', 'About', 'Events', 'Sponsors', 'Contact'].map((item) => (
                <Link
                  key={item}
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                  className="text-white hover:text-gray-300 transition-colors font-medium text-lg py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <Link 
                to="/PaymentFlow"
                className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-3 rounded-full hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 border border-gray-600 mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register Now
              </Link>
            </div>
          )}

          <Link 
            to="/PaymentFlow"
            className="hidden md:inline-block bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 text-sm sm:text-base border border-gray-600"
          >
            Register Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 pt-16 pb-8 sm:pt-0 sm:pb-0">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="hero-title text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 sm:mb-8 opacity-0 leading-tight">
            CHAITANYA
          </h1>
          
          <p className="hero-subtitle text-base sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto px-2 sm:px-4 opacity-0 leading-relaxed">
            Where Innovation Meets Imagination • Annual Tech Fest • November 6-8, 2025
          </p>

          {/* Registration Deadline Warning Banner */}
          <div className="mb-8 sm:mb-10 mx-auto max-w-4xl px-4">
            <div className="hero-cta bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white p-4 sm:p-6 rounded-2xl shadow-2xl border-4 border-red-400 transform hover:scale-105 transition-all">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <span className="text-4xl sm:text-5xl">🚫</span>
                <div className="text-center sm:text-left">
                  <p className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wide mb-1">
                    ⚠️ REGISTRATIONS CLOSED ⚠️
                  </p>
                  <p className="text-sm sm:text-base md:text-lg font-bold">
                    Registration window has ended
                  </p>
                  <p className="text-xs sm:text-sm font-semibold mt-1 text-yellow-200">
                    Thank you for your interest in CHAITANYA 2025
                  </p>
                </div>
                <span className="text-4xl sm:text-5xl">🚫</span>
              </div>
            </div>
          </div>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center opacity-0">
            <button 
              onClick={handleRegisterNow}
              className="register-button w-full sm:w-auto bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-black hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 transition-all transform hover:scale-110 shadow-2xl border-2 border-yellow-400 animate-pulse-glow relative overflow-hidden"
            >
              <span className="relative z-10">🚀 Register Now - Limited Seats!</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            </button>
            <button 
              onClick={handleExploreEvents}
              className="w-full sm:w-auto bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 shadow-2xl border border-gray-600"
            >
              Explore Events
            </button>
            <a 
              href="https://youtu.be/SBMIiYYeDNU?si=sAOfNW6F6n-4csAN" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <button className="watch-trailer-btn w-full flex items-center justify-center space-x-2 sm:space-x-3 border-2 border-yellow-400 bg-yellow-400 text-black px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-yellow-300 hover:border-yellow-300 transition-colors transform hover:scale-105 group relative overflow-hidden">
                {/* Electric shock effect background */}
                <div className="electric-bg absolute inset-0"></div>
                
                {/* Glitch effect overlay */}
                <div className="glitch-overlay absolute inset-0"></div>
                
                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span className="glitch-text relative z-10" data-text="Watch Trailer">Watch Trailer</span>
              </button>
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section relative py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {[
            { number: 5000, label: "Participants" },
            { number: 50, label: "Events" },
            { number: 100, label: "Speakers" },
            { number: 25, label: "Workshops" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="count-number text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-1 sm:mb-2">
                0
              </div>
              <div className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-block mb-4">
              <span className="text-yellow-400 text-sm sm:text-base font-mono bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/30">
                ✨ Featured Highlights
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 sm:mb-6">
              <span className="text-gray-500">&lt;</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500">
                What's Happening
              </span>
              <span className="text-gray-500">/&gt;</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Dive into a world of innovation, competition, and creativity at CHAITANYA 2025
            </p>
          </div>

          {/* Features Grid with Enhanced Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card group relative opacity-0"
              >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                
                {/* Card Content */}
                <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-700/50 group-hover:border-yellow-400/50 transition-all duration-500 h-full flex flex-col">
                  {/* Icon with Animated Background */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative text-5xl sm:text-6xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 transition-all duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed flex-1">
                    {feature.description}
                  </p>

                  {/* Decorative Bottom Line */}
                  <div className="mt-6 pt-4 border-t border-gray-700/50 group-hover:border-yellow-400/30 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-mono">0{index + 1}</span>
                      <div className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12 sm:mt-16">
            <button 
              onClick={handleExploreEvents}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 transition-all transform hover:scale-105 shadow-2xl border-2 border-yellow-400/50"
            >
              <span>Explore All Events</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Morphing Section - Full Screen Images */}
      <section className="gallery-section relative overflow-hidden bg-black py-12 sm:py-16 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white text-center mb-8 sm:mb-12 md:mb-16 relative z-10">
            <span className="text-gray-400">#</span>
            Glimpses of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">CHAITANYA</span>
            <span className="text-gray-400">#</span>
          </h2>

          {/* Full Screen Image Grid with Morphing Effect */}
          <div className="relative w-full h-[60vh] md:h-[65vh] lg:h-[70vh] max-h-[600px]">
            {/* Image 1 - Top Left */}
            <div className="gallery-img-1 absolute top-0 left-0 w-1/2 h-1/2 overflow-hidden">
              <img 
                src={img1} 
                alt="Chaitanya Event 1" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/40"></div>
            </div>

            {/* Image 2 - Top Right */}
            <div className="gallery-img-2 absolute top-0 right-0 w-1/2 h-1/2 overflow-hidden">
              <img 
                src={img2} 
                alt="Chaitanya Event 2" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-black/20 to-black/40"></div>
            </div>

            {/* Image 3 - Center (Main Focus) */}
            <div className="gallery-img-3 absolute top-1/4 left-1/4 w-1/2 h-1/2 overflow-hidden shadow-2xl z-20 border-4 border-white">
              <img 
                src={img3} 
                alt="Chaitanya Event 3" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>

            {/* Image 4 - Bottom Left */}
            <div className="gallery-img-4 absolute bottom-0 left-0 w-1/2 h-1/2 overflow-hidden">
              <img 
                src={img4} 
                alt="Chaitanya Event 4" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-black/20 to-black/40"></div>
            </div>

            {/* Image 5 - Bottom Right */}
            <div className="gallery-img-5 absolute bottom-0 right-0 w-1/2 h-1/2 overflow-hidden">
              <img 
                src={img5} 
                alt="Chaitanya Event 5" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-black/20 to-black/40"></div>
            </div>

            {/* Decorative glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 pointer-events-none mix-blend-overlay"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-6 sm:mb-8">
            Ready to <span className="text-gray-300">Innovate</span>?
          </h2>
          <p className="text-base sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
            Join thousands of tech enthusiasts, innovators, and creators at CHAITANYA 2025
          </p>
          <button 
            onClick={handleRegisterNow}
            className="register-button w-full sm:w-auto bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-8 py-4 sm:px-12 sm:py-6 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-black hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 transition-all transform hover:scale-110 shadow-2xl border-2 border-yellow-400 animate-pulse-glow relative overflow-hidden"
          >
            <span className="relative z-10">🚀 Register Now - Limited Seats!</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 sm:py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center space-x-4 sm:space-x-8 mb-6 sm:mb-8 flex-wrap">
            {[
              { name: 'Twitter', url: '#' },
              { name: 'Instagram', url: 'https://www.instagram.com/chaitanyahptu/?hl=en' },
              { name: 'LinkedIn', url: '#' },
              { name: 'GitHub', url: '#' }
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-300 transition-colors text-sm sm:text-base mb-2"
              >
                {social.name}
              </a>
            ))}
          </div>
          <p className="text-gray-300 text-sm sm:text-base font-medium">
            © 2025 CHAITANYA Tech Fest. Built with 🖤 by HPTU Students
          </p>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(251, 146, 60, 0.5), 0 0 40px rgba(251, 146, 60, 0.3), 0 0 60px rgba(251, 146, 60, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(251, 146, 60, 0.8), 0 0 60px rgba(251, 146, 60, 0.5), 0 0 80px rgba(251, 146, 60, 0.3);
          }
        }

        @keyframes electric-pulse {
          0%, 100% {
            background: linear-gradient(45deg, transparent 30%, rgba(251, 191, 36, 0.1) 50%, transparent 70%);
            background-size: 200% 200%;
            background-position: 0% 0%;
          }
          25% {
            background-position: 100% 100%;
          }
          50% {
            background: linear-gradient(-45deg, transparent 30%, rgba(251, 191, 36, 0.2) 50%, transparent 70%);
            background-size: 200% 200%;
            background-position: 100% 0%;
          }
          75% {
            background-position: 0% 100%;
          }
        }

        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        @keyframes glitch-text {
          0% {
            text-shadow: 0 0 0 transparent;
          }
          20% {
            text-shadow: -2px 0 0 rgba(255, 0, 0, 0.5), 2px 0 0 rgba(0, 255, 255, 0.5);
          }
          40% {
            text-shadow: 2px 0 0 rgba(255, 0, 0, 0.5), -2px 0 0 rgba(0, 255, 255, 0.5);
          }
          60% {
            text-shadow: -2px 0 0 rgba(0, 255, 255, 0.5), 2px 0 0 rgba(255, 0, 0, 0.5);
          }
          80% {
            text-shadow: 2px 0 0 rgba(0, 255, 255, 0.5), -2px 0 0 rgba(255, 0, 0, 0.5);
          }
          100% {
            text-shadow: 0 0 0 transparent;
          }
        }

        .watch-trailer-btn {
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.4), 0 0 35px rgba(251, 191, 36, 0.3);
          animation: glitch 0.5s infinite;
        }

        .watch-trailer-btn:hover {
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.7), 0 0 60px rgba(251, 191, 36, 0.5);
        }

        .electric-bg {
          animation: electric-pulse 1.5s infinite;
          opacity: 1;
        }

        .glitch-text {
          animation: glitch-text 0.5s infinite;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-overlay {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(251, 191, 36, 0.1) 25%,
            transparent 50%,
            rgba(251, 191, 36, 0.1) 75%,
            transparent 100%
          );
          animation: glitch 0.7s infinite;
          opacity: 1;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .register-button:hover {
          animation: pulse-glow 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;