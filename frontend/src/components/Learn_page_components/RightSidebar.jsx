import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import CircularProgress from "./CircularProgress";
import SidebarLoader from "./SidebarLoader";

export default function RightSidebar({
  rightSidebarOpen,
  setRightSidebarOpen,
  colorMode,
  progressData,
  progressLoading,
  activeField,
  roadmapReady,
}) {
  const [animateProgress, setAnimateProgress] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isDark = colorMode === "dark";

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!rightSidebarOpen || !roadmapReady) {
      setAnimateProgress(false);
      return;
    }
    setAnimateProgress(true);
  }, [rightSidebarOpen, roadmapReady]);

  // Progress Content Component (reused in both desktop and mobile)
  const ProgressContent = () => (
    <>
      {/* 1️⃣ Sidebar open but roadmap not ready */}
      {!roadmapReady && (
        <div className={`flex flex-col items-center justify-center h-full ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4" />
          <p>Preparing learning progress…</p>
        </div>
      )}

      {/* 2️⃣ Roadmap ready but fetching progress */}
      {roadmapReady && progressLoading && <SidebarLoader />}

      {/* 3️⃣ Progress available */}
      {roadmapReady && !progressLoading && progressData && (
        <>
          {/* ================= FIXED SECTION (NO SCROLL) ================= */}
          <div className="shrink-0">
            <div className="flex justify-center">
              <CircularProgress
                fieldName={progressData.field}
                percentage={progressData.overall_progress ?? 0}
                colorMode={colorMode}
              />
            </div>
          </div>

          {/* ================= SCROLLABLE TOPICS ================= */}
          <div className="flex-1 min-h-0 mt-8 space-y-3 overflow-y-auto">
            {progressData.topics.map((t, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <div className={`text-xs break-words ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {t.name}
                  </div>
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {t.progress}%
                  </span>
                </div>

                <div className={`h-2 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                  <div
                    className="h-full bg-blue-500 rounded transition-all duration-700"
                    style={{ width: `${t.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Fallback */}
      {roadmapReady && !progressLoading && !progressData && (
        <p className={`text-center py-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          No progress data available
        </p>
      )}
    </>
  );

  // Mobile Modal Overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {rightSidebarOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRightSidebarOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-[90vw] max-w-[400px] h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDark ? "bg-gray-800" : "bg-white"
                }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
                }`}>
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                  Learning Progress
                </h2>
                <button
                  onClick={() => setRightSidebarOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Content */}
              <div className={`flex-1 overflow-y-auto p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                <ProgressContent />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Sidebar (original behavior)
  return (
    <div
      className={`
        hidden md:flex
        relative mt-16
        h-[calc(100vh-64px)]
        transition-[width] duration-300
        ${rightSidebarOpen ? "w-[420px]" : "w-[60px]"}
      `}
    >
      {/* 🔹 SCROLLABLE WRAPPER (SCROLLBAR OUTSIDE BORDER) */}
      <div
        className="
          flex-1
          overflow-y-auto
          pr-2
          scrollbar-thin
          scrollbar-thumb-gray-500
          scrollbar-track-transparent
        "
      >
        {/* 🔹 INNER BORDER BOX (NO SCROLL) */}
        <div
          className={`
            h-full
            flex flex-col
            border-l
            ${isDark
              ? "bg-gray-900 border-gray-700 text-gray-100"
              : "bg-gray-50 border-gray-200 text-gray-900"}
            p-3
          `}
        >
          {/* CONTENT ONLY WHEN OPEN */}
          {rightSidebarOpen && <ProgressContent />}
        </div>
      </div>

      {/* 🔘 TOGGLE BUTTON (ALWAYS VISIBLE) */}
      <button
        onClick={() => setRightSidebarOpen((v) => !v)}
        className="absolute top-1/2 -left-3 bg-blue-600 text-white p-2 rounded-full shadow-lg"
      >
        {rightSidebarOpen ? <FiChevronRight /> : <FiChevronLeft />}
      </button>
    </div>
  );
}
