import React from "react";

export default function CircularProgress({
  size = 140,
  stroke = 15,
  percentage = 0,
  fieldName = "",
  colorMode = "dark",
}) {
  const isDark = colorMode === "dark";

  // -----------------------------
  // SAFE FIELD NAME HANDLING
  // -----------------------------
  const safeFieldName =
    typeof fieldName === "string" ? fieldName : fieldName?.field || "";

  const shortName = (() => {
    if (!safeFieldName) return "";

    if (safeFieldName.length <= 4 && !safeFieldName.includes(" ")) {
      return safeFieldName.toUpperCase();
    }

    return safeFieldName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  })();

  // -----------------------------
  // CIRCLE CALCULATIONS
  // -----------------------------
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(percentage, 100) / 100) * circumference;

  // Theme-aware colors
  const bgStroke = isDark ? "#374151" : "#e5e7eb"; // gray-700 / gray-200
  const progressStroke = "#3b82f6"; // blue-500
  const textColor = isDark ? "fill-white" : "fill-gray-800";
  const subTextColor = isDark ? "fill-gray-400" : "fill-gray-500";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="mb-2">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgStroke}
          strokeWidth={stroke}
          fill="none"
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressStroke}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />

        {/* Percentage Text */}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          className={`${textColor} text-xl font-bold`}
        >
          {percentage}%
        </text>

        {/* Short Field Name */}
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          className={`${subTextColor} text-sm tracking-widest`}
        >
          {shortName}
        </text>
      </svg>
    </div>
  );
}
