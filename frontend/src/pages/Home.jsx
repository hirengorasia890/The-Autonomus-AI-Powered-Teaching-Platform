import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, MessageSquare, MapPin, Phone, Target, Sprout, CalendarDays, Rocket, CheckCircle2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";

export default function Home({ isLoggedIn: propIsLoggedIn }) {
  const [showImage, setShowImage] = useState(false);
  const [highlightLumos, setHighlightLumos] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const location = useLocation(); // Add this to check current path
  const { toast } = useToast();

  const handleNavigate = (path) => {
    setMenuOpen(false);

    // Only clear session data when NOT going to Learn
    if (path.toLowerCase() !== "/learn") {
      sessionStorage.removeItem("lastSelection");
      sessionStorage.removeItem("currentStep");
    }

    navigate(path, { replace: true });
  };

  // Animation variants for menu
  const menuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  const paragraph =
    "Have a question, suggestion, or need support? Our AI-powered team is ready to assist you anytime — let’s make learning easier together.";
  const letters = paragraph.split("");

  const letterVariants = {
    hidden: { opacity: 0, y: "0.5em" },
    visible: {
      opacity: 1,
      y: "0em",
      transition: {
        duration: 0.05,
      },
    },
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("https://getform.io/f/adrdxzya", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        toast({
          title: "Message Sent Successfully!",
          description:
            "Thank you for contacting VidhyanAI. We’ll get back to you soon!",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast({
          title: "Failed to Send Message",
          description: "Something went wrong. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          "Unable to send message. Try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setIsLoggedIn(!!user);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowImage(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(
      () => setHighlightLumos((prev) => !prev),
      5000
    );
    return () => clearInterval(intervalId);
  }, []);

  const scrollWithNavigation = (sectionId) => {
    setActiveSection(sectionId); // Set active section immediately on click
    setMenuOpen(false);

    // If already on home page, just scroll
    if (location.pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        const navHeight = 80; // Height of fixed navbar
        const sectionTop = section.offsetTop - navHeight;
        window.scrollTo({
          top: sectionTop,
          behavior: "smooth",
        });
      }
    } else {
      // Navigate to home and then scroll
      navigate("/", { replace: true });
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          const navHeight = 80;
          const sectionTop = section.offsetTop - navHeight;
          window.scrollTo({
            top: sectionTop,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  // Scroll detection for active section highlighting
  useEffect(() => {
    const sections = ["home", "about", "who-is-it-for", "benefits", "how-it-works", "service", "contact"];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for better detection

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const startSessionForCurrentField = () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const savedFields = JSON.parse(localStorage.getItem("savedFields")) || [];

    if (!user || !user.field) {
      toast({
        title: "No field selected",
        description: "Please select a field first.",
        variant: "destructive",
      });
      return;
    }

    // Find the user's current field in savedFields
    const fieldObj = savedFields.find(
      (f) => f.name.toLowerCase() === user.field.toLowerCase()
    );

    if (!fieldObj) {
      toast({
        title: "Field not found",
        description: "Please create or select a valid field.",
        variant: "destructive",
      });
      return;
    }

    // Generate start time (now)
    const now = new Date();
    const fromTime = now.toTimeString().slice(0, 5); // HH:MM

    // Forced 1-hour session
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    const toTime = end.toTimeString().slice(0, 5);

    const selection = {
      branch: user.branch,
      field: user.field,
      fromTime,
      toTime,
      durationMs: 3600000, // 1 hour
      timestamp: Date.now(),
    };

    sessionStorage.setItem("lastSelection", JSON.stringify(selection));

    // jump to Learn
    handleNavigate("/learn");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-[#0b1120] shadow-lg fixed top-0 w-full z-50">
        <div className="max-w-8xl flex items-center justify-between px-6 py-3">
          {/* Left: Logo */}
          <div
            className="flex items-center space-x-3 relative overflow-hidden cursor-pointer"
            onClick={() => handleNavigate("/")}
          >
            <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src="icon01.svg"
                alt="logo"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="lumos-text text-2xl font-semibold tracking-wide text-cyan-400">
              <span className="char">V</span>
              <span className="char">i</span>
              <span className="char">d</span>
              <span className="char">h</span>
              <span className="char">y</span>
              <span className="char">a</span>
              <span className="char">n</span>
              <span className="char">A</span>
              <span className="char">I</span>
            </h1>
          </div>

          {/* Center Links (visible only on large screens) */}
          <div className="hidden md:flex space-x-8 text-white text-lg font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
            {[
              { id: "home", label: "Home" },
              { id: "about", label: "About" },
              { id: "who-is-it-for", label: "Who is it for" },
              { id: "benefits", label: "Benefits" },
              { id: "how-it-works", label: "How it works" },
              { id: "service", label: "Services" },
              { id: "contact", label: "Contact" },
            ].map((item) => (
              <p
                key={item.id}
                onClick={() => scrollWithNavigation(item.id)}
                className={`cursor-pointer transition-all duration-300 relative pb-1 ${activeSection === item.id
                  ? "text-cyan-400"
                  : "hover:text-cyan-400"
                  }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-full"></span>
                )}
              </p>
            ))}
          </div>

          {/* Right Side: Hamburger (mobile only) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-cyan-400 text-black focus:outline-none md:hidden"
            aria-label="Toggle Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop Right Buttons */}
          <div className="hidden md:flex items-center mr-4">
            <button
              onClick={() => handleNavigate("/login")}
              className="bg-cyan-400 px-2 py-1 rounded-md mr-4 font-semibold text-gray-700 hover:bg-cyan-300 hover:scale-105 transition"
            >
              Login
            </button>
          </div>
        </div>

        {/* Mobile Animated Menu */}
        <motion.div
          className="fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-gray-900 to-black shadow-2xl z-50 md:hidden"
          initial="closed"
          animate={menuOpen ? "open" : "closed"}
          variants={menuVariants}
        >
          {/* Menu Items */}
          <div className="flex flex-col p-6 pt-20 space-y-6 mx-6">
            {[
              { id: "home", label: "Home" },
              { id: "about", label: "About" },
              { id: "who-is-it-for", label: "Who is it for" },
              { id: "benefits", label: "Benefits" },
              { id: "how-it-works", label: "How it works" },
              { id: "service", label: "Services" },
              { id: "contact", label: "Contact" },
            ].map((item, i) => (
              <p
                key={i}
                onClick={() => scrollWithNavigation(item.id)}
                tabIndex={0}
                className={`text-lg font-semibold cursor-pointer transition-all duration-200 relative pb-1 ${activeSection === item.id
                  ? "text-cyan-400"
                  : "text-white active:text-cyan-400 focus:text-cyan-400 md:hover:text-cyan-400"
                  }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-cyan-400 rounded-full"></span>
                )}
              </p>
            ))}

            {/* Divider */}
            <div className="h-px bg-cyan-400/20 my-2"></div>

            <button
              onClick={() => handleNavigate("/login")}
              className="
          mt-2 bg-white text-black font-semibold
          w-20 px-2 py-1 rounded-lg
          hover:bg-cyan-400 active:scale-95
          transition-all duration-200
          text-center text-xl
      "
            >
              Login
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setMenuOpen(false)}
            className="
      absolute top-4 left-4 p-2 rounded-full
      bg-cyan-500 text-gray-900
      hover:bg-cyan-400 active:scale-90
      transition-all
    "
            aria-label="Close Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </motion.div>
      </nav>

      {/* Hero Section - Agentic AI Theme */}
      <section
        id="home"
        className="scroll-mt-20 relative flex flex-col justify-center items-center bg-gradient-to-b from-[#030712] via-[#0b1120] to-[#0f172a] min-h-[100vh] w-full overflow-hidden pt-20 px-4 text-center"
      >
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Floating AI Agent Orbs */}
        <motion.div
          className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 opacity-60 blur-sm"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-50 blur-sm"
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-32 left-[20%] w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 opacity-50 blur-sm"
          animate={{
            y: [0, -20, 0],
            x: [0, 25, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-40 right-[10%] w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-40 blur-sm"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            scale: [1, 0.85, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Central Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]"></div>

        {/* Connecting Lines Animation */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <motion.line
            x1="10%" y1="30%" x2="40%" y2="50%"
            stroke="url(#cyanGradient)" strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.line
            x1="60%" y1="50%" x2="90%" y2="35%"
            stroke="url(#cyanGradient)" strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, delay: 1 }}
          />
          <motion.line
            x1="20%" y1="70%" x2="50%" y2="50%"
            stroke="url(#purpleGradient)" strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 1.5, delay: 0.5 }}
          />
          <motion.line
            x1="50%" y1="50%" x2="85%" y2="65%"
            stroke="url(#purpleGradient)" strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 1.5, delay: 1.5 }}
          />
          <defs>
            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Main Content */}
        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-cyan-400/30 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-sm text-cyan-300 font-medium">Your Smart Learning Companion</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Your Personal
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Agentic AI Tutor
            </span>
          </motion.h1>

          {/* Pain Point */}
          <motion.p
            className="text-base sm:text-lg text-gray-400 italic max-w-xl mx-auto"
            style={{ fontFamily: "'Inter', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Tired of confusion, scattered resources, and lack of direction in your learning journey?
          </motion.p>

          {/* Subtitle - Benefits focused */}
          <motion.p
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            VidhyanAI builds your <span className="text-cyan-400 font-semibold">personalized learning path</span>,
            <span className="text-purple-400 font-semibold"> schedules daily lessons</span>, and
            <span className="text-emerald-400 font-semibold"> teaches you step-by-step</span> —
            so you stay consistent without the stress.
          </motion.p>

          {/* Agent Pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            {[
              { name: "Planning", color: "from-cyan-500 to-blue-600" },
              { name: "Scheduling", color: "from-purple-500 to-pink-600" },
              { name: "Teaching", color: "from-emerald-500 to-cyan-600" },
              { name: "Reminders", color: "from-amber-500 to-yellow-500" },
              { name: "Doubt Support", color: "from-rose-500 to-red-600" },
              { name: "Progress Tracking", color: "from-indigo-500 to-violet-600" },
            ].map((agent, i) => (
              <motion.span
                key={i}
                className={`px-4 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r ${agent.color} shadow-lg`}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 211, 238, 0.4)" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {agent.name}
              </motion.span>
            ))}
          </motion.div>

          {/* Helper text for pills */}
          <motion.p
            className="text-sm text-gray-400 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Each part of your learning is handled for you — planning, teaching, reminders, and support.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <button
              onClick={() => handleNavigate("/login")}
              className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Start Learning Free</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
            </button>
            <button
              onClick={() => scrollWithNavigation("how-it-works")}
              className="px-8 py-3 rounded-full border-2 border-white/20 text-white font-semibold text-lg hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300"
            >
              See How It Works
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {[
              { value: "6+", label: "AI Features" },
              { value: "100%", label: "Personalized" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-cyan-400">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="scroll-mt-10 bg-gradient-to-b from-[#0f182b] to-[#050a15] min-h-screen py-20 px-6 sm:px-10 flex flex-col items-center "
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-semibold text-center text-cyan-400 mb-14"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          About VidhyanAI
        </motion.h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT SIDE – What is VidhyanAI */}
          <motion.div
            className="bg-white/5 border border-cyan-400/20 rounded-2xl p-8"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-4 text-cyan-400">
              What is VidhyanAI?
            </h3>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                <span className="text-white font-medium">VidhyanAI</span> is your complete AI-powered learning companion — more than just a tutor.
              </p>
              <p>
                It creates a <span className="text-cyan-400">personalized learning roadmap</span> based on your chosen field,
                schedules your daily lessons, and teaches you step-by-step.
              </p>
              <p>
                You simply tell VidhyanAI what you want to learn and when you're available.
                <span className="text-purple-400 font-medium"> The AI handles everything else.</span>
              </p>
            </div>
          </motion.div>

          {/* RIGHT SIDE – How You Benefit Daily */}
          <motion.div
            className="bg-white/5 border border-cyan-400/20 rounded-2xl p-8"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-4 text-cyan-400">
              How You Benefit Every Day
            </h3>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="text-emerald-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                <span><span className="text-white">No more confusion</span> — clear, structured lessons every day</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="text-emerald-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                <span><span className="text-white">No more planning</span> — your learning schedule is ready automatically</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="text-emerald-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                <span><span className="text-white">No more feeling stuck</span> — get answers to your doubts instantly</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="text-emerald-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                <span><span className="text-white">Stay consistent</span> — reminders keep you on track without stress</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who is VidhyanAI for? Section */}
      <section
        id="who-is-it-for"
        className="scroll-mt-20 min-h-screen bg-gradient-to-b from-[#050a15] to-[#0f182b] py-20 px-6 sm:px-10"
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-semibold text-center text-cyan-400 mb-6"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Who is VidhyanAI for?
        </motion.h2>

        <motion.p
          className="text-center text-gray-400 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          VidhyanAI is designed for anyone who wants to learn smarter, not harder.
        </motion.p>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              Icon: Target,
              color: "text-cyan-400",
              title: "Confused Students",
              desc: "Who feel lost with too many resources and no clear path",
            },
            {
              Icon: Sprout,
              color: "text-emerald-400",
              title: "Complete Beginners",
              desc: "Who don't know where to start their learning journey",
            },
            {
              Icon: CalendarDays,
              color: "text-purple-400",
              title: "Self-Learners",
              desc: "Who struggle to stay consistent without guidance",
            },
            {
              Icon: Rocket,
              color: "text-amber-400",
              title: "Professionals",
              desc: "Who want to upgrade their skills efficiently",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-white/5 border border-cyan-400/20 backdrop-blur-sm rounded-2xl p-6 text-center hover:border-cyan-400/50 hover:bg-white/10 transition-all duration-300 cursor-default"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: i * 0.15,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 40px rgba(34, 211, 238, 0.2)"
              }}
            >
              <motion.div
                className="flex justify-center mb-4"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: i * 0.15 + 0.3, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
              >
                <item.Icon className={`w-10 h-10 ${item.color}`} />
              </motion.div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-white mt-12 text-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          If that sounds like you, <span className="text-cyan-400 font-semibold">VidhyanAI is here to help.</span>
        </motion.p>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="scroll-mt-20 bg-gradient-to-b from-[#0f182b] to-[#050a15] min-h-screen py-5 px-6 sm:px-10 flex flex-col items-center"
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-semibold text-center text-cyan-400 mb-14"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Why Choose VidhyanAI?
        </motion.h2>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {[
            {
              title: "Personalized Learning Paths",
              desc: "AI adapts lessons based on your goals, skill level, and learning speed — no more one-size-fits-all education.",
            },
            {
              title: "Learn at Your Own Pace",
              desc: "Flexible sessions allow you to learn anytime, anywhere, without pressure or rigid schedules.",
            },
            {
              title: "Concepts Made Simple",
              desc: "Complex topics are broken down into easy, structured explanations with real-world examples.",
            },
            {
              title: "Multi-Domain Knowledge",
              desc: "Explore AI, technology, science, and more from a single intelligent platform.",
            },
            {
              title: "Smart Visual Learning",
              desc: "Images, structured flows, and step-by-step guidance improve understanding and retention.",
            },
            {
              title: "Future-Ready Skills",
              desc: "Stay ahead with industry-relevant knowledge designed to prepare you for real-world challenges.",
            },
            {
              title: "Confidence Without Fear",
              desc: "Learn without pressure or fear. VidhyanAI guides you gently, even if you are a complete beginner.",
            },
          ].map((b, i) => (
            <motion.div
              key={i}
              className={`
        ${i % 2 === 0
                  ? "border-l-4 border-cyan-400 pl-6 text-left"
                  : "border-l-4 border-cyan-400 pl-6 text-left"
                }
      `}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">
                {b.title}
              </h3>
              <p className="text-white text-md leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How VidhyanAI Works Section */}
      <section
        id="how-it-works"
        className="scroll-mt-20 bg-gradient-to-b from-[#050a15] to-[#0f182b] min-h-screen py-10 px-6 sm:px-10"
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-semibold text-center text-cyan-400 mb-14"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          How VidhyanAI Works
        </motion.h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {[
            {
              step: "Step 1",
              title: "You choose your goal",
              desc: "Select the field you want to learn and set your preferred daily learning time. VidhyanAI uses this information to build your personalized learning routine.",
            },
            {
              step: "Step 2",
              title: "AI builds your roadmap",
              desc: "A dedicated planning AI agent creates a structured learning roadmap based on your selected field and goals, breaking topics into clear, step-by-step paths.",
            },
            {
              step: "Step 3",
              title: "AI schedules your learning",
              desc: "Another AI agent converts your roadmap into a daily learning schedule that fits exactly within your chosen time, ensuring focused and consistent sessions.",
            },
            {
              step: "Step 4",
              title: "You get notified",
              desc: "Before each session begins, VidhyanAI sends you a reminder so you never miss your learning time and stay consistent without effort.",
            },
            {
              step: "Step 5",
              title: "AI teaches you every day",
              desc: "During your scheduled sessions, teaching AI agents deliver structured lessons, clear explanations, and guided learning—just like a personal teacher.",
            },
            {
              step: "Step 6",
              title: "Learning runs automatically",
              desc: "VidhyanAI works silently in the background, handling planning, scheduling, and delivery for you. You just show up and learn.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="border-l-4 border-cyan-400 pl-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-cyan-400 text-gray-900 text-sm font-bold px-3 py-1 rounded-full">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-white">
                  {item.title}
                </h3>
              </div>
              <p className="text-gray-300 text-md leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section
        id="service"
        className="scroll-mt-20 bg-gradient-to-b from-[#0f182b] to-[#050a15] min-h-screen py-20 px-6 sm:px-10 flex flex-col items-center "
      >
        <motion.h2
          className="text-cyan-400 text-3xl font-semibold mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Our Services
        </motion.h2>

        {/* First Row - 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl mb-6">
          {[
            {
              title: "Education by AI",
              desc: "Learn with AI — get personalized guidance and adaptive learning.",
              icon: "fas fa-robot",
            },
            {
              title: "Learning of Multiple Fields",
              desc: "Explore science, design, and more — all in one platform.",
              icon: "fas fa-layer-group",
            },
            {
              title: "Index based Learning",
              desc: "Learn step-by-step in a structured and organized way.",
              icon: "fas fa-list-ol",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="bg-gray-800/80 border border-cyan-400/20 p-6 rounded-2xl shadow-[0_0_20px_#00ffff33] text-center hover:shadow-[0_0_30px_#00ffffaa] hover:border-cyan-400/50 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4 text-cyan-400 text-4xl">
                <i className={s.icon}></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-cyan-400 min-h-[20px] flex items-center justify-center">
                {s.title}
              </h3>
              <div className="w-16 h-1 bg-cyan-400 mx-auto mb-3 rounded-full"></div>
              <p className="text-gray-300 text-md leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Second Row - 2 cards centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
          {[
            {
              title: "Simplified Learning by Images",
              desc: "Understand better through visuals and easy explanations.",
              icon: "fas fa-image",
            },
            {
              title: "Daily Learning Habit",
              desc: "Build a strong learning habit with fixed sessions, reminders, and guided consistency.",
              icon: "fas fa-calendar-check",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="bg-gray-800/80 border border-cyan-400/20 p-6 rounded-2xl shadow-[0_0_20px_#00ffff33] text-center hover:shadow-[0_0_30px_#00ffffaa] hover:border-cyan-400/50 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 3) * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4 text-cyan-400 text-4xl">
                <i className={s.icon}></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-cyan-400 min-h-[20px] flex items-center justify-center">
                {s.title}
              </h3>
              <div className="w-16 h-1 bg-cyan-400 mx-auto mb-3 rounded-full"></div>
              <p className="text-gray-300 text-md leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="scroll-mt-20 bg-gradient-to-b from-[#050a15] to-[#0f182b] text-white flex flex-col items-center justify-center min-h-screen py-20 px-6"
      >
        <div className="text-center px-4 py-10 max-w-3xl">
          <motion.h2
            className="text-4xl font-semibold mb-4 text-cyan-400"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Get in Touch with VidhyanAI
          </motion.h2>

          <motion.p
            className="text-white leading-relaxed mx-auto mb-12 max-w-2xl"
            initial="hidden"
            whileInView="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.035 } },
            }}
            viewport={{ once: true }}
          >
            {letters.map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                style={{ display: "inline-block", whiteSpace: "pre" }}
              >
                {char}
              </motion.span>
            ))}
          </motion.p>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="border border-white rounded-2xl p-8 shadow-[0_0_20px_#00ffff33]">
            <h3 className="text-2xl font-semibold mb-6 text-cyan-400">
              Contact Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Mail className="text-cyan-400" />
                <p>support@VidhyanAI.com</p>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="text-cyan-400" />
                <p>+91 94849 91823</p>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="text-cyan-400" />
                <p>VidhyanAI HQ, Rajkot, Gujarat</p>
              </div>
              <div className="flex items-center space-x-4">
                <MessageSquare className="text-cyan-400" />
                <p>Chat Support Available 24/7</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="border border-white rounded-2xl p-8 shadow-[0_0_20px_#00ffff33]"
          >
            <h3 className="text-2xl font-semibold mb-6 text-cyan-400">
              Send a Message
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleChange}
                className="bg-gray-800 p-3 rounded-lg text-white outline-none border border-gray-700 focus:border-cyan-400"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                className="bg-gray-800 p-3 rounded-lg text-white outline-none border border-gray-700 focus:border-cyan-400"
                required
              />
            </div>
            <input
              type="text"
              name="subject"
              placeholder="Subject *"
              value={formData.subject}
              onChange={handleChange}
              className="w-full bg-gray-800 p-3 rounded-lg text-white border border-gray-700 focus:border-cyan-400 mb-4"
              required
            />
            <textarea
              name="message"
              rows={5}
              placeholder="Your Message... *"
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-gray-800 p-3 rounded-lg text-white border border-gray-700 focus:border-cyan-400 mb-6 resize-none"
              required
            ></textarea>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-semibold py-3 rounded-lg transition-all"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            <p className="text-white text-sm mt-3 text-center">
              All fields marked with * are required
            </p>
          </form>
        </div>
      </section>

      <footer className="border-t border-cyan-400/30 bg-gradient-to-b from-[#0f182b] to-[#050a15] text-white pt-14">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
          {/* Logo & Purpose */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-6">
              {/* <div className="flex flex-col items-center space-y-3"> */}
              <img
                src="/icon01.svg"
                alt="VidhyanAI Logo"
                className="w-14 h-14 rounded-full shadow-[0_0_20px_#00ffff55]"
              />
              <h2 className="text-2xl font-semibold text-cyan-400">VidhyanAI</h2>
            </div>

            <p className="text-md leading-relaxed text-gray-300 font-semibold text-justify md:text-left">
              VidhyanAI is an intelligent AI-powered learning platform designed to
              simplify complex technologies. We provide structured, adaptive,
              and personalized learning paths that help learners grow
              confidently in AI and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-md">
              <li onClick={() => scrollWithNavigation("home")} className="hover:text-cyan-400 cursor-pointer">Home</li>
              <li onClick={() => scrollWithNavigation("about")} className="hover:text-cyan-400 cursor-pointer">About</li>
              <li onClick={() => scrollWithNavigation("who-is-it-for")} className="hover:text-cyan-400 cursor-pointer">Who is it for</li>
              <li onClick={() => scrollWithNavigation("benefits")} className="hover:text-cyan-400 cursor-pointer">Benefits</li>
              <li onClick={() => scrollWithNavigation("how-it-works")} className="hover:text-cyan-400 cursor-pointer">How it works</li>
              <li onClick={() => scrollWithNavigation("service")} className="hover:text-cyan-400 cursor-pointer">Services</li>
              <li onClick={() => scrollWithNavigation("contact")} className="hover:text-cyan-400 cursor-pointer">Contact</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">
              Contact
            </h3>

            <div className="space-y-3 text-md">
              <div className="flex items-center justify-center md:justify-start gap-3 whitespace-nowrap">
                <Mail className="text-cyan-400 w-4 h-4" />
                <span>support@VidhyanAI.com</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3 whitespace-nowrap">
                <Phone className="text-cyan-400 w-4 h-4" />
                <span>+91 94849 91823</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <MapPin className="text-cyan-400 w-4 h-4" />
                <span>Rajkot, Gujarat, India</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3 whitespace-nowrap">
                <MessageSquare className="text-cyan-400 w-4 h-4" />
                <span>24/7 AI Chat Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cyan-400/20 mt-12 py-4 text-center">
          <p className="text-sm text-white">
            © {new Date().getFullYear()} VidhyanAI — Empowering Education with
            Intelligence
          </p>
        </div>
      </footer>
    </>
  );
}
