import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user info from localStorage on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      // If no user, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  // Logout logic
  const handleLogout = () => {
    localStorage.removeItem("currentUser"); // remove logged-in user
    sessionStorage.removeItem("hasSpoken"); // 🔹 reset speech flag for next user
    setUser(null);
    setMenuOpen(false);
    navigate("/login"); // redirect to login
  };


  return (
    <nav className="fixed top-0 w-full flex z-50 justify-between items-center bg-gray-800 px-6 py-3 shadow-md">
      {/* Logo Section */}
      <div className="flex items-center space-x-4">
        <img src="/logo.png" className="w-10 h-10 mb-2 rounded-full" alt="Logo" />
        <h1 className="text-2xl font-semibold tracking-wide text-white">VidhyanAI</h1>
      </div>

      {/* Desktop Navbar Links */}
      <div className="hidden md:flex space-x-8">
        {user && (
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-600 transition-colors duration-200" >
            <img src="/logout.png" className="h-5 inline-block"></img>&nbsp;&nbsp;&nbsp;Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
