import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ContactPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const navigationRef = useRef(null);
  const particlesRef = useRef(null);

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

      gsap.fromTo(".contact-card",
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 1.5,
          stagger: 0.2
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
      gsap.fromTo(".info-card",
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".info-section",
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

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

      // Interactive hover effects
      const setupHoverEffects = () => {
        // Contact cards hover
        gsap.utils.toArray(".contact-card").forEach((card) => {
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

        // Info cards hover
        gsap.utils.toArray(".info-card").forEach((card) => {
          card.addEventListener("mouseenter", () => {
            gsap.to(card, {
              y: -5,
              duration: 0.3,
              ease: "power2.out"
            });
          });
          card.addEventListener("mouseleave", () => {
            gsap.to(card, {
              y: 0,
              duration: 0.3,
              ease: "power2.out"
            });
          });
        });

        // Navigation hover
        gsap.utils.toArray(".nav-item").forEach((item) => {
          item.addEventListener("mouseenter", () => {
            gsap.to(item, {
              scale: 1.1,
              color: "#10b981",
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
    });

    return () => ctx.revert();
  }, []);

  const contactMethods = [
    {
      icon: "📧",
      title: "Email Us",
      details: [
        "pro.advaitkaushal@gmail.com",
        "chaitanyahptu@gmail.com"
      ],
      description: "Send us an email for any queries or information"
    },
    {
      icon: "📱",
      title: "Call Us",
      details: [
        "+91 9459111001"
      ],
      description: "Available during business hours"
    },
    {
      icon: "�‍💻",
      title: "Tech Team",
      details: [
        "Priyanshu Attri: 7018753204"
      ],
      description: "Technical support and assistance"
    },
    {
      icon: "�📍",
      title: "Visit Us",
      details: [
        "Himachal Pradesh Technical University",
        "Hamirpur, Himachal Pradesh"
      ],
      description: "Come visit our campus"
    }
  ];

  const quickInfo = [
    {
      icon: "⏰",
      title: "Response Time",
      value: "Within 24 hours",
      color: "text-emerald-400"
    },
    {
      icon: "🔄",
      title: "Availability",
      value: "Mon - Sat, 9AM - 6PM",
      color: "text-blue-400"
    },
    {
      icon: "💬",
      title: "Support",
      value: "Technical & General",
      color: "text-purple-400"
    },
    {
      icon: "🌐",
      title: "Social Media",
      value: "Instagram Active",
      color: "text-pink-400"
    }
  ];

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="parallax-bg absolute inset-0 bg-gradient-to-br from-gray-800/50 via-black/30 to-gray-900/50" />
        <div className="parallax-element absolute top-1/4 left-1/4 w-64 h-64 bg-gray-600/20 rounded-full blur-3xl" />
        <div className="parallax-element absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-700/20 rounded-full blur-3xl" />
        
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
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full animate-pulse" />
            <span className="text-white font-mono text-lg sm:text-xl font-bold">CHAITANYA</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {['Home', 'About', 'Events', 'Sponsors', 'Contact'].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className={`nav-item text-white hover:text-gray-300 transition-colors font-medium ${item === 'Contact' ? 'text-gray-300' : 'opacity-0'} text-sm lg:text-base`}
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
                  className={`text-white hover:text-gray-300 transition-colors font-medium text-lg py-2 ${item === 'Contact' ? 'text-gray-300' : ''}`}
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
            CONTACT US
          </h1>
          
          <p className="hero-subtitle text-base sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto px-2 sm:px-4 opacity-0 leading-relaxed">
            Get in Touch • We're Here to Help • Quick Response Guaranteed
          </p>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="contact-card bg-gray-800/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-700/70 hover:border-gray-400/50 transition-all duration-300 group opacity-0"
              >
                <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {method.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-gray-300 transition-colors">
                  {method.title}
                </h3>
                <div className="space-y-2 mb-3 sm:mb-4">
                  {method.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-300 font-medium text-sm sm:text-base">
                      {detail}
                    </p>
                  ))}
                </div>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  {method.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="info-section relative py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white text-center mb-8 sm:mb-16">
            <span className="text-gray-400">⚡</span>
            Quick Information
            <span className="text-gray-400">⚡</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {quickInfo.map((info, index) => (
              <div
                key={index}
                className="info-card bg-gray-800/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-700/70 hover:border-gray-400/50 transition-all duration-300 group opacity-0"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">
                  {info.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  {info.title}
                </h3>
                <p className="text-lg sm:text-xl font-semibold text-gray-300">
                  {info.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Contact Section */}
      <section className="relative py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-6 sm:mb-8">
            Need <span className="text-gray-300">Immediate</span> Help?
          </h2>
          <p className="text-base sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
            For urgent matters, feel free to call us directly or send an email. We'll get back to you as soon as possible.
          </p>
          
          <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-600/50 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-4">📞</div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Direct Call</h3>
                <p className="text-gray-300 font-bold text-lg sm:text-xl">+91 9459111001</p>
                <p className="text-gray-400 text-sm mt-2">Advait Kaushal</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-4">📧</div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Primary Email</h3>
                <p className="text-gray-300 font-bold text-base sm:text-lg">pro.advaitkaushal@gmail.com</p>
                <p className="text-gray-400 text-sm mt-2">Official Contact</p>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 bg-gray-800/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-600/50 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Fest Email</h3>
            <p className="text-gray-300 font-bold text-lg sm:text-xl mb-2">chaitanyahptu@gmail.com</p>
            <p className="text-gray-400 text-sm">For general fest-related queries and information</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 sm:py-12 px-4 border-t border-gray-700/50">
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
          <p className="text-gray-500 text-xs sm:text-sm">
            © 2025 CHAITANYA Tech Fest. Built with 🖤 by HPTU Students
          </p>
          <div className="mt-4 text-gray-600 text-xs">
            Contact: pro.advaitkaushal@gmail.com | +91 9459111001
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;