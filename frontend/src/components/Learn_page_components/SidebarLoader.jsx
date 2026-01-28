// -----------------------------
// SIDEBAR LOADER COMPONENT
// -----------------------------
import React from "react";

export default function SidebarLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
