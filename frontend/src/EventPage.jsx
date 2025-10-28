import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const EventPage = () => {
  const containerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Enhanced events data with more accurate information from PDF
  const events = {
    technical: [
      {
        id: 1,
        name: "Code Forge",
        tagline: "Innovate, Collaborate, Create.",
        category: "technical",
        duration: "36 Hours",
        schedule: "Day 1 (9:00 AM) to Day 2 (9:00 PM)",
        description: "A 36-hour marathon coding competition where multidisciplinary teams converge to design, develop, and present a functional software or hardware solution. The goal is to tackle real-world problems or develop creative projects based on a specific theme revealed at the event kickoff.",
        rules: "Teams of 2-5 members. All code must be created during the event. Use of public domain libraries, APIs, frameworks permitted. Pre-built components not allowed. Projects must be submitted digitally via designated platform.",
        judging: "Innovation & Creativity (30%), Technical Complexity (25%), Completion & Functionality (25%), Presentation & UI/UX (20%)",
        resources: "Large hall with power and internet, mentoring support, breakout rooms, 24-hour security",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-blue-500 to-cyan-500",
        price: 199,
        teamSize: "2-5 members",
        targetAudience: "Programmers, Developers and Hardware Enthusiasts",
        requirements: "Original code created during event, submission includes demo link, project description, and source code"
      },
      {
        id: 2,
        name: "Datathon",
        tagline: "ML Model Challenge",
        category: "technical",
        duration: "24 Hours",
        schedule: "24-hour continuous competition",
        description: "Time-bound competition focused on model training and performance prediction. Participants apply data cleaning, exploratory data analysis (EDA), feature engineering, and advanced machine learning techniques to solve a defined, real-world predictive problem under time constraints.",
        rules: "Teams of 2-4. Maximum 5 submissions in 24 hours. External data forbidden. CSV submission format with ID and Prediction columns. No code sharing between teams.",
        judging: "Technical Performance (80%) - RMSE/AUC/F1-Score, Leaderboard split (30% Public, 70% Private test data)",
        resources: "Kaggle platform, high-performance computers with GPUs, datasets (train.csv, test.csv, sample_submission.csv)",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-purple-500 to-pink-500",
        price: 199,
        teamSize: "2-4 members",
        targetAudience: "AIML enthusiasts",
        requirements: "Final deliverables: Source code and Methodology Report (max 500 words)"
      },
      {
        id: 3,
        name: "Project Bazaar",
        tagline: "Time to Show Off",
        category: "technical",
        duration: "6 Hours",
        schedule: "Day 3",
        description: "Flagship exhibition event providing a premier platform for students to showcase their innovative technical projects, research, and prototypes from any technical domain (software, hardware, IoT, AI/ML, robotics, etc.).",
        rules: "Individuals or teams up to 4. Functional prototype required. Professional conduct expected at booths. Safety guidelines must be followed for electrical/mechanical projects.",
        judging: "Innovation & Originality (30%), Technical Feasibility (25%), Impact & Relevance (20%), Presentation (15%), Scalability (10%) + Audience Voting",
        resources: "Exhibition space with tables and power, display boards, internet, voting system",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-green-500 to-teal-500",
        price: 0,
        teamSize: "1-4 members",
        targetAudience: "Programmers, Developers, designers, Builders, software and Hardware Enthusiasts",
        requirements: "Functional prototype or comprehensive simulation, display materials"
      },
      {
        id: 4,
        name: "Integration Bee",
        tagline: "The Ultimate Calculus Challenge",
        category: "technical",
        duration: "1 Hour each day",
        schedule: "Multiple Days",
        description: "Fast-paced competition inspired by MIT's Integration Bee, designed to challenge mathematical prowess in solving definite and indefinite integrals. Features qualifier rounds, head-to-head matches, and playoffs.",
        rules: "Individual competition. No calculators, notes, or electronic devices. Whiteboards provided. Problems verified by Engineering Department.",
        judging: "Accuracy and speed. Correct solutions with integration constant required. Speed determines winner in ties.",
        resources: "Lecture hall, personal stations with writing materials, central display, timer",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-orange-500 to-red-500",
        price: 99,
        teamSize: "Individual",
        targetAudience: "Students with strong proficiency in calculus and mathematics",
        requirements: "Mathematical knowledge, no external aids allowed"
      },
      {
        id: 5,
        name: "Under the Hood",
        tagline: "Reverse Engineering Challenge",
        category: "technical",
        duration: "3 Hours",
        schedule: "To be scheduled",
        description: "Challenge participants to analyze and deconstruct compiled software, proprietary file formats, or encrypted protocols to uncover hidden flags. Uses binary executables, firmware images, obfuscated scripts, or network captures.",
        rules: "Teams of 1-3. BYOD with VM. Static analysis tools allowed. No collaboration between teams. No infrastructure attacks.",
        judging: "Points based on difficulty (Easy: 100, Medium: 250, Hard: 500). Tie-breaker: earliest submission and quality of write-up.",
        resources: "Computer lab, BYOD with pre-installed tools (Ghidra, GDB, Wireshark), CTF platform",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-indigo-500 to-purple-500",
        price: 149,
        teamSize: "1-3 members",
        targetAudience: "Students with background in assembly, C/C++, debugging, ethical hacking",
        requirements: "Laptop with VM, reverse engineering tools, flag submission in exact format"
      },
      {
        id: 6,
        name: "Capture the Flag",
        tagline: "Cybersecurity Challenge",
        category: "technical",
        duration: "6 Hours",
        schedule: "To be scheduled",
        description: "Cybersecurity competition where participants find and exploit vulnerabilities in various systems to capture flags. Covers web exploitation, forensics, cryptography, and more.",
        rules: "Teams of 2-4. Ethical hacking only. No DoS attacks on infrastructure. Flag submission in correct format required.",
        judging: "Points per flag based on difficulty. Real-time scoreboard. First to finish tie-breaker.",
        resources: "CTF platform, dedicated servers, monitoring tools, networking infrastructure",
        image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-red-500 to-pink-500",
        price: 149,
        teamSize: "2-4 members",
        targetAudience: "Cybersecurity enthusiasts, ethical hackers",
        requirements: "Cybersecurity knowledge, appropriate tools"
      }
    ],
    nonTechnical: [
      {
        id: 7,
        name: "Retro-Theming",
        tagline: "A Blast from the Digital Past",
        category: "nonTechnical",
        duration: "2-3 Hours",
        schedule: "Day 2",
        description: "Creative design challenge where participants must theme a given digital interface based on a retro-tech aesthetic (e.g., 80s computing, pixel art, early Windows OS, 1980s Arcade Game).",
        rules: "Individual or teams up to 3. Original work created during event. No AI. Single image submission. Use of open-source fonts and basic stock icons permitted.",
        judging: "Adherence to Theme, Creativity & Originality, Visual Appeal & Execution, UI/UX Considerations",
        resources: "BYOD with design software, provided mockup, projector for theme display",
        image: "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-yellow-500 to-amber-500",
        price: 99,
        teamSize: "1-4 members",
        targetAudience: "UI/UX designers, graphic design enthusiasts, creative individuals",
        requirements: "Design software, creativity, no pre-made complex assets"
      },
      {
        id: 8,
        name: "Human vs AI",
        tagline: "Man vs Machine",
        category: "nonTechnical",
        duration: "1-2 Hours",
        schedule: "Day 1",
        description: "Three segments where humans compete against AI in art creation, essay writing, and poetry. Tests creativity, research, and expression capabilities against AI models.",
        rules: "No outside assistance for humans. AI gets one prompt only (max 300 chars). No internet during some tasks. Single AI model for all tasks. No pre-existing content copying.",
        judging: "Blind judging for essays. Audience voting for art and poetry. No bias towards creator.",
        resources: "Computers with AI access, art supplies, timing system, internet restrictions",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-pink-500 to-rose-500",
        price: 99,
        teamSize: "Individual",
        targetAudience: "Engineering students, students interested in AI",
        requirements: "Art supplies, research skills, creativity within constraints"
      },
      {
        id: 9,
        name: "Prompt Engineering",
        tagline: "Magic of Words",
        category: "nonTechnical",
        duration: "1-2 Hours",
        schedule: "Day 2",
        description: "Participants use generative AI tools to create text or images based on given themes. Challenge lies in crafting effective and imaginative text prompts to guide AI in producing compelling outcomes.",
        rules: "Individual. Two preliminary rounds (text & image generation) + final round (website development). Single-hit prompts only in prelims, max 3 prompts in finals.",
        judging: "Accuracy, creative detailing, structure, completion with minimal prompts. Penalties for multiple prompts or misconduct.",
        resources: "AI tools access, competition themes, judging platform",
        image: "https://www.masaischool.com/blog/content/images/2024/08/Prompt-Blog.png",
        color: "from-teal-500 to-cyan-500",
        price: 99,
        teamSize: "Individual",
        targetAudience: "Anyone interested in AI, content creation and creative technology",
        requirements: "Prompt crafting skills, AI tool familiarity"
      }
    ],
    other: [
      {
        id: 10,
        name: "E-sports",
        tagline: "Game On!",
        category: "other",
        duration: "6 Hours",
        schedule: "Multiple Days",
        description: "Multi-game tournament featuring Mobile (Free Fire Max & BGMI) and PC (Valorant) competitions. LAN setup with elimination and point-based formats.",
        rules: "Teams of 4-5 + 1 substitute. BYOD for mobile. No hacks, emulators, or teaming. Stable internet required. University ID verification.",
        judging: "Placement points + kill points. Match wins for Valorant. Tournament progression.",
        resources: "Gaming arena, high-speed internet, streaming setup, referees, timing system",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-green-500 to-emerald-500",
        price: 149,
        teamSize: "4-5 members + 1 substitute",
        targetAudience: "Gamers, esports enthusiasts",
        requirements: "Own devices, game accounts, stable connection"
      },
      {
        id: 11,
        name: "PolyMath",
        tagline: "Escape Room Challenge",
        category: "other",
        duration: "3 Hours",
        schedule: "Day 2",
        description: "Multi-stage puzzle challenge pushing participants through layers of logic, strategy, and pattern recognition to achieve final digital escape. Sequential rounds with hidden clues leading to access code for final matrix escape.",
        rules: "Teams of up to 3. No external electronic devices in final round. Sequential progression required. Hidden clues form access code.",
        judging: "Successful completion and clue extraction. First to escape wins. Time-based tie-breaker.",
        resources: "Multiple rooms, puzzle materials, chess boards, final laptop with password file, clue tracking",
        image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-purple-500 to-indigo-500",
        price: 149,
        teamSize: "Up to 3 members",
        targetAudience: "Students interested in puzzles, critical thinking, strategic games",
        requirements: "Logical reasoning, pattern recognition, teamwork"
      },
      {
        id: 12,
        name: "The Jack's Game",
        tagline: "Solitary Confinement",
        category: "other",
        duration: "4-5 Hours",
        schedule: "To be scheduled",
        description: "Psychological deduction game inspired by Alice in Borderland. Players must deduce hidden symbols while identifying the embedded liar (Jack of Hearts) through alliance-building and deception.",
        rules: "Individual participation (10-14 players). Symbol collars, interaction and judgment phases. Accusation system with consequences for wrong accusations.",
        judging: "Survival-based. Player victory if Jack identified, Jack victory if all players eliminated. Survivor score for ties.",
        resources: "Symbol collars, solitary zones, ID cards, game master, timing system, score tracker",
        image: "https://d7hftxdivxxvm.cloudfront.net/?height=796&quality=50&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2Ffx_ex_g9BZSQmdyKSyjF_w%2Fnormalized.jpg&width=800",
        color: "from-red-500 to-orange-500",
        price: 99,
        teamSize: "Individual",
        targetAudience: "Psychology enthusiasts, deduction game players",
        requirements: "Deduction skills, social interaction, strategic thinking"
      },
      {
        id: 13,
        name: "Debate",
        tagline: "Express Logical Opinions",
        category: "other",
        duration: "1 Hour",
        schedule: "To be scheduled",
        description: "Competitive debate on business, management, ethics, leadership, and startup topics. Teams present arguments and rebuttals on given topics with structured format.",
        rules: "Teams of 2 members. Topics given 45-60 minutes in advance. 3-4 minute speeches + 2-minute rebuttals. No personal attacks or offensive language.",
        judging: "Content & Argumentation, Clarity & Communication, Confidence & Body Language, Rebuttal & Presence of Mind, Time Management",
        resources: "Debate venue, timing system, judging panel, topic preparation area",
        image: "https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-blue-500 to-cyan-500",
        price: 50,
        teamSize: "2 members",
        targetAudience: "Public speakers, critical thinkers",
        requirements: "Research skills, public speaking, logical reasoning"
      },
      {
        id: 14,
        name: "Two-minute Manager",
        tagline: "Quick Thinking Leadership",
        category: "other",
        duration: "1 Hour",
        schedule: "To be scheduled",
        description: "Teams present solutions to organizational problems and marketing strategies within strict time limits. Tests communication, decision-making, and quick thinking under pressure across two rounds.",
        rules: "Teams of 2. 10 minutes preparation, 2 minutes presentation. No devices. Time penalties for exceeding limits. Different scenarios for each team.",
        judging: "Decision-making ability, Creativity & Practicality, Confidence & Communication, Time Management",
        resources: "Problem chits, timing system, judging panel, preparation area",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-green-500 to-teal-500",
        price: 80,
        teamSize: "2 members",
        targetAudience: "Management students, aspiring leaders",
        requirements: "Quick thinking, communication skills, management knowledge"
      }
    ],
    cultural: [
      {
        id: 15,
        name: "Singing/Stand-up/Dancing",
        tagline: "Where Art Meets Heart",
        category: "cultural",
        duration: "Varies by category",
        schedule: "Across 3 Days",
        description: "Platform for participants to showcase vocal, comedy, and dance talents. Multiple categories including solo, duet, and group performances with strict time limits.",
        rules: "Group size: 3-8 members. Strict time limits. Pre-submitted audio tracks. Props and costumes encouraged but self-managed.",
        judging: "Technical Skill, Creativity & Originality, Stage Presence & Expression, Overall Impact",
        resources: "Stage, sound system, lighting, judging panel, timing system",
        image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-purple-500 to-pink-500",
        price: 99,
        teamSize: "Solo, Duet, or Group (3-8)",
        targetAudience: "Performers, artists, entertainers",
        requirements: "Performance skills, audio tracks, adherence to time limits"
      },
      {
        id: 16,
        name: "Workshops",
        tagline: "Learn and Grow",
        category: "cultural",
        duration: "Varies",
        schedule: "Across 3 Days",
        description: "Educational sessions covering various technical and non-technical topics. Hands-on learning experiences with expert instructors and interactive components.",
        rules: "Registration may be required. Active participation encouraged. Follow workshop guidelines.",
        judging: "Participation-based certificates, skill development assessment",
        resources: "Workshop materials, expert instructors, venue setup, technical equipment",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        color: "from-orange-500 to-yellow-500",
        price: 0,
        teamSize: "Individual",
        targetAudience: "All students interested in learning",
        requirements: "Registration, active participation"
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

      // Category filter animation
      gsap.fromTo(".category-filter",
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

      // Event cards animation
      gsap.fromTo(".event-card",
        { opacity: 0, y: 80, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".events-grid",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

    }, containerRef);

    return () => {
      ctx.revert();
      // Cleanup: ensure body scroll is restored when component unmounts
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Filter events based on active category
  const filteredEvents = activeCategory === 'all' 
    ? [...events.technical, ...events.nonTechnical, ...events.other, ...events.cultural]
    : events[activeCategory] || [];

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    
    // Animate category change
    gsap.to(".event-card", {
      opacity: 0,
      y: 50,
      duration: 0.3,
      onComplete: () => {
        // After fade out, the filtered events will render
        // Then animate them in
        setTimeout(() => {
          gsap.fromTo(".event-card",
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

  const openEventModal = (event) => {
    setSelectedEvent(event);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Animate modal in
    setTimeout(() => {
      gsap.to(".event-modal", {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
      });
    }, 10);
  };

  const closeEventModal = () => {
    gsap.to(".event-modal", {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setSelectedEvent(null);
        // Re-enable body scroll
        document.body.style.overflow = 'auto';
      }
    });
  };

  const handleRegister = (event) => {
    // Re-enable body scroll before navigation
    document.body.style.overflow = 'auto';
    
    // Store event data in sessionStorage for the payment flow
    sessionStorage.setItem('selectedEvent', JSON.stringify(event));
    
    // Navigate using React Router
    navigate('/PaymentFlow');
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeEventModal();
    }
  };

  const categories = [
    { id: 'all', label: 'All Events', color: 'from-cyan-500 to-blue-500', count: filteredEvents.length },
    { id: 'technical', label: 'Technical', color: 'from-purple-500 to-pink-500', count: events.technical.length },
    { id: 'nonTechnical', label: 'Non-Technical', color: 'from-orange-500 to-red-500', count: events.nonTechnical.length },
    { id: 'other', label: 'Other Activities', color: 'from-green-500 to-emerald-500', count: events.other.length },
    { id: 'cultural', label: 'Cultural', color: 'from-yellow-500 to-amber-500', count: events.cultural.length }
  ];

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
            <span className="text-cyan-400 font-medium border-b-2 border-cyan-400">Events</span>
            <Link to="/contact" className="text-white hover:text-cyan-400 transition-colors font-medium">
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
              <Link to="/" className="text-white hover:text-cyan-400 transition-colors font-medium text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/about" className="text-white hover:text-cyan-400 transition-colors font-medium text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
              <span className="text-cyan-400 font-medium text-lg py-2 border-b-2 border-cyan-400">Events</span>
              <Link to="/contact" className="text-white hover:text-cyan-400 transition-colors font-medium text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>
              <Link 
                to="/PaymentFlow" 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register Now
              </Link>
            </div>
          )}

          <Link 
            to="/PaymentFlow" 
            className="hidden md:inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 text-sm sm:text-base"
          >
            Register Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="hero-title text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 opacity-0">
            EVENTS
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto px-4">
            Discover the ultimate tech experience with 16+ cutting-edge competitions, 
            from hackathons to esports, AI challenges to cultural performances at Himachal Pradesh Technical University.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="relative py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`category-filter px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold transition-all transform hover:scale-105 relative text-sm sm:text-base ${
                  activeCategory === category.id 
                    ? `bg-gradient-to-r ${category.color} text-white shadow-2xl` 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.label}
                <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* Active Category Display */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {categories.find(cat => cat.id === activeCategory)?.label} 
              <span className="text-cyan-400 ml-2">({filteredEvents.length} events)</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              {activeCategory === 'all' 
                ? 'Showing all available events' 
                : `Showing ${activeCategory} events`
              }
            </p>
          </div>

          {/* Events Grid */}
          <div className="events-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="event-card group cursor-pointer opacity-0"
                onClick={() => openEventModal(event)}
              >
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-lg border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-500 h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-transparent z-10" />
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="relative z-20 p-4 sm:p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${event.color} text-white`}>
                        {event.category === 'nonTechnical' ? 'Non-Tech' : event.category}
                      </span>
                      <span className="text-gray-400 text-xs sm:text-sm">{event.duration}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {event.name}
                    </h3>
                    <p className="text-cyan-400 text-xs sm:text-sm mb-3 italic line-clamp-1">{event.tagline}</p>
                    <p className="text-gray-300 text-xs sm:text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-cyan-400 font-bold text-sm sm:text-base">
                        {event.price === 0 ? 'FREE' : `₹${event.price}`}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEventModal(event);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm sm:text-base"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl">No events found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Event Modal */}
      {selectedEvent && (
        <div 
          className="event-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm opacity-0 scale-90"
          onClick={handleBackdropClick}
          ref={modalRef}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl border border-cyan-500/30">
            <button
              onClick={closeEventModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 bg-gray-800 rounded-full p-1"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative h-48 sm:h-64 overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
                <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r ${selectedEvent.color} text-white mb-2 inline-block`}>
                  {selectedEvent.category === 'nonTechnical' ? 'Non-Technical' : selectedEvent.category}
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-white">{selectedEvent.name}</h2>
                <p className="text-cyan-400 text-sm sm:text-lg italic">{selectedEvent.tagline}</p>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Event Details</h3>
                  <div className="space-y-3 text-gray-300 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="text-cyan-400">{selectedEvent.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Schedule:</span>
                      <span className="text-cyan-400">{selectedEvent.schedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Team Size:</span>
                      <span className="text-cyan-400">{selectedEvent.teamSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Audience:</span>
                      <span className="text-cyan-400 text-right max-w-[60%]">{selectedEvent.targetAudience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Registration Fee:</span>
                      <span className="text-cyan-400 font-bold">
                        {selectedEvent.price === 0 ? 'FREE' : `₹${selectedEvent.price}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Description</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{selectedEvent.description}</p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-3">Rules & Format</h4>
                  <p className="text-gray-300 text-sm sm:text-base">{selectedEvent.rules}</p>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-3">Judging Criteria</h4>
                  <p className="text-gray-300 text-sm sm:text-base">{selectedEvent.judging}</p>
                </div>
              </div>

              {selectedEvent.requirements && (
                <div className="mt-6 sm:mt-8">
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-3">Requirements</h4>
                  <p className="text-gray-300 text-sm sm:text-base">{selectedEvent.requirements}</p>
                </div>
              )}

              <div className="mt-6 sm:mt-8">
                <h4 className="text-lg sm:text-xl font-bold text-white mb-3">Resources Provided</h4>
                <p className="text-gray-300 text-sm sm:text-base">{selectedEvent.resources}</p>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => handleRegister(selectedEvent)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 sm:py-4 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-600 transition-all text-sm sm:text-base"
                >
                  Register for this Event
                </button>
                <button className="flex-1 border-2 border-cyan-500 text-cyan-400 py-3 sm:py-4 rounded-xl font-bold hover:bg-cyan-500 hover:text-white transition-all text-sm sm:text-base">
                  Add to Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPage;