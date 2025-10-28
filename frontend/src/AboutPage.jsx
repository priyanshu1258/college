import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const contentRef = useRef(null);
  const imagesRef = useRef(null);
  const footerRef = useRef(null);
  const backgroundRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current, 
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Stats animation with stagger
      gsap.fromTo(".stat-item",
        { opacity: 0, y: 50, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Content section animation
      gsap.fromTo(contentRef.current,
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Images animation
      gsap.fromTo(".image-item",
        { opacity: 0, scale: 0.8, rotationY: 45 },
        {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: imagesRef.current,
            start: "top 60%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Features animation
      gsap.fromTo(".feature-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".features-grid",
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Footer animation
      gsap.fromTo(footerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Background parallax effect
      gsap.to(".parallax-bg-1", {
        y: 100,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });

      gsap.to(".parallax-bg-2", {
        y: 50,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5
        }
    });

      // Floating elements animation
      gsap.to(".floating-element", {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5
      });

      // Hover animations for interactive elements
      const setupHoverAnimations = () => {
        // Stats hover
        gsap.utils.toArray(".stat-item").forEach((stat) => {
          stat.addEventListener("mouseenter", () => {
            gsap.to(stat, {
              scale: 1.05,
              y: -5,
              duration: 0.3,
              ease: "power2.out"
            });
          });
          stat.addEventListener("mouseleave", () => {
            gsap.to(stat, {
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out"
            });
          });
        });

        // Features hover
        gsap.utils.toArray(".feature-item").forEach((feature) => {
          feature.addEventListener("mouseenter", () => {
            gsap.to(feature, {
              scale: 1.02,
              y: -2,
              duration: 0.3,
              ease: "power2.out"
            });
          });
          feature.addEventListener("mouseleave", () => {
            gsap.to(feature, {
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out"
            });
          });
        });

        // Images hover
        gsap.utils.toArray(".image-container").forEach((container) => {
          const img = container.querySelector('img');
          const overlay = container.querySelector('.image-overlay');
          
          container.addEventListener("mouseenter", () => {
            gsap.to(img, {
              scale: 1.1,
              duration: 0.5,
              ease: "power2.out"
            });
            gsap.to(overlay, {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          });
          
          container.addEventListener("mouseleave", () => {
            gsap.to(img, {
              scale: 1,
              duration: 0.5,
              ease: "power2.out"
            });
            gsap.to(overlay, {
              opacity: 0,
              duration: 0.3,
              ease: "power2.out"
            });
          });
        });
      };

      setupHoverAnimations();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const techStats = [
    { number: "50+", label: "Academic Programs", icon: "🎓" },
    { number: "10K+", label: "Students", icon: "👨‍🎓" },
    { number: "200+", label: "Faculty Members", icon: "👨‍🏫" },
    { number: "50+", label: "Research Labs", icon: "🔬" }
  ];

  const features = [
    {
      icon: "🚀",
      title: "Cutting-Edge Research",
      description: "Advanced research facilities with state-of-the-art laboratories and innovation centers."
    },
    {
      icon: "💻",
      title: "Tech Infrastructure",
      description: "High-performance computing labs, AI research centers, and modern digital classrooms."
    },
    {
      icon: "🌐",
      title: "Global Collaborations",
      description: "Partnerships with leading tech companies and international universities."
    },
    {
      icon: "⚡",
      title: "Innovation Hub",
      description: "Incubation center for startups and student-led tech projects."
    }
  ];

  const images = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      alt: "Advanced Campus Infrastructure",
      title: "Smart Campus"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      alt: "Research Laboratories",
      title: "Research Labs"
    },
    {
      id: 3,
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT0AsgMeCn5uocEMz9cCgtLS1vrRod3yPfSg&s",
      alt: "Digital Learning Spaces",
      title: "Digital Learning"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      alt: "Innovation Center",
      title: "Innovation Hub"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Navigation Bar */}
      <nav className="relative z-50 py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
            <span className="text-white font-mono text-xl font-bold group-hover:text-gray-300 transition-colors">
              CHAITANYA
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-gray-300 transition-colors font-medium">
              Home
            </Link>
            <span className="text-gray-300 font-medium border-b-2 border-gray-300">About</span>
            <Link to="/events" className="text-white hover:text-gray-300 transition-colors font-medium">
              Events
            </Link>
            <Link to="/contact" className="text-white hover:text-gray-300 transition-colors font-medium">
              Contact
            </Link>
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
              <Link to="/" className="text-white hover:text-gray-300 transition-colors font-medium text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <span className="text-gray-300 font-medium text-lg py-2 border-b-2 border-gray-300">About</span>
              <Link to="/events" className="text-white hover:text-gray-300 transition-colors font-medium text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Events
              </Link>
              <Link to="/contact" className="text-white hover:text-gray-300 transition-colors font-medium text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>
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
            className="hidden md:inline-block bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-2 rounded-full hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 border border-gray-600"
          >
            Register Now
          </Link>
        </div>
      </nav>

      <section 
        ref={sectionRef}
        className="py-20 px-4 relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden" ref={backgroundRef}>
          <div className="parallax-bg-1 absolute -top-40 -right-40 w-96 h-96 bg-gray-700/20 rounded-full blur-3xl" />
          <div className="parallax-bg-2 absolute -bottom-40 -left-40 w-96 h-96 bg-gray-600/20 rounded-full blur-3xl" />
          
          {/* Floating dots */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="floating-element absolute top-20 left-20 w-2 h-2 bg-gray-400 rounded-full" />
            <div className="floating-element absolute top-40 right-32 w-1 h-1 bg-gray-500 rounded-full" />
            <div className="floating-element absolute bottom-32 left-32 w-1 h-1 bg-gray-400 rounded-full" />
            <div className="floating-element absolute bottom-20 right-20 w-2 h-2 bg-gray-500 rounded-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div ref={headerRef} className="text-center mb-20 opacity-0">
            <div className="inline-flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
              <span className="text-gray-400 text-sm font-mono">HPTU.TECH</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500">
              ABOUT_US
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-gray-400 to-gray-500 mx-auto mb-8 rounded-full" />
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
              Pioneering the Future of Technical Education Through Innovation, Research & Digital Transformation
            </p>
          </div>

          {/* Tech Stats Grid */}
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {techStats.map((stat, index) => (
              <div
                key={index}
                className="stat-item bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-gray-400 transition-all duration-300 group opacity-0"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1 group-hover:text-gray-300 transition-colors">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start mb-20">
            {/* Main Content */}
            <div ref={contentRef} className="space-y-8 opacity-0">
              <div className="bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
                <h2 className="text-4xl font-bold text-white mb-6">
                  <span className="text-gray-400">&lt;</span>
                  Himachal Pradesh Technical University
                  <span className="text-gray-400">/&gt;</span>
                </h2>
                
                <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                  <p>
                    Welcome to <span className="text-gray-300 font-semibold">HPTU</span>, where we're 
                    redefining the boundaries of technical education through cutting-edge technology, 
                    innovative research, and digital transformation.
                  </p>
                  
                  <p>
                    Established as a premier institution in the heart of Himachal Pradesh, we've 
                    evolved into a <span className="text-gray-400">technology powerhouse</span> 
                    that bridges the gap between academic excellence and industry requirements.
                  </p>

                  <div className="bg-gray-900/70 rounded-xl p-6 border-l-4 border-gray-400">
                    <div className="font-mono text-sm text-gray-300 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">// Our Mission</span>
                      </div>
                      <div className="text-white pl-4">
                        To create a ecosystem where technology, innovation, and education converge 
                        to produce the next generation of tech leaders and problem solvers.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="features-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="feature-item bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-gray-400 transition-all duration-300 group opacity-0"
                  >
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gray-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Images Grid */}
            <div ref={imagesRef} className="grid grid-cols-2 gap-6">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`image-item image-container relative group cursor-pointer opacity-0 ${
                    index === 1 ? 'row-span-2' : ''
                  }`}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-600/20 to-gray-700/20 p-1 h-full">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover rounded-xl transition-transform duration-500"
                    />
                    <div className="image-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-500" />
                    <div className="absolute bottom-4 left-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="text-white font-semibold">{image.title}</div>
                      <div className="text-gray-300 text-sm">{image.alt}</div>
                    </div>
                    <div className="absolute top-4 right-4 w-3 h-3 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack & Contact Section */}
          <div ref={footerRef} className="bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-700 opacity-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tech Stack */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  <span className="text-gray-400">#</span> Our Tech Ecosystem
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {['AI/ML Labs', 'Cloud Computing', 'IoT Research', 'Cybersecurity', 'Data Science', 'Blockchain'].map((tech, index) => (
                    <div key={index} className="flex items-center space-x-3 group">
                      <div className="w-2 h-2 bg-gray-400 rounded-full group-hover:animate-pulse" />
                      <span className="text-gray-300 group-hover:text-gray-400 transition-colors">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">
                  <span className="text-gray-400">&gt;</span> Connect With Us
                </h3>
                
                <a 
                  href="https://www.himtu.ac.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-2xl hover:shadow-gray-500/25 transform hover:-translate-y-1 font-semibold group border border-gray-600"
                >
                  <span>Explore HPTU.TECH</span>
                  <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-900/70 rounded-xl border border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Digital Communication</div>
                    <a href="mailto:chaitanyahptu@gmail.com" className="text-white hover:text-gray-300 transition-colors text-lg font-semibold">
                      chaitanyahptu@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;