// components/ui/card.jsx
import React from "react";

// Main Card wrapper
export function Card({ children, className }) {
  return (
    <div
      className={`bg-gray-900 text-gray-300 rounded-2xl shadow-lg border border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

// Card Header
export function CardHeader({ children, className }) {
  return (
    <div className={`border-b border-gray-700 px-4 py-3 ${className}`}>
      {children}
    </div>
  );
}

// Card Title
export function CardTitle({ children, className }) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

// Card Content
export function CardContent({ children, className }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
