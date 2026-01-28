import React, { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
    >
      {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon />}
    </button>
  );
}

export default ThemeToggle;
