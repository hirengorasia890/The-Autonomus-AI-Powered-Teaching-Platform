// components/AITypingIndicator.jsx
import React from "react";

// ChatGPT-style blinking cursor dot
export function TypingCursor({ colorMode = "dark" }) {
  const isDark = colorMode === "dark";
  return (
    <span className="inline-flex items-center ml-1">
      <span
        className={`inline-block w-2 h-2 rounded-full animate-pulse ${isDark ? "bg-blue-400" : "bg-blue-500"
          }`}
        style={{
          animation: "blink 1s infinite",
        }}
      />
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

// Full typing indicator with text (shown below content)
export default function AITypingIndicator({ colorMode = "dark" }) {
  const isDark = colorMode === "dark";
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? "bg-blue-400" : "bg-blue-500"}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? "bg-blue-500" : "bg-blue-600"}`}></span>
      </span>
      <span className={`text-md ${isDark ? "text-gray-400" : "text-gray-500"}`}>AI is typing</span>
    </div>
  );
}
