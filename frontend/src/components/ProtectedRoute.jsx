import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { checkLoginExpiry, clearAllSessionData, getSessionContext } from "../utils/learnHelpers";

export default function ProtectedRoute({ children, requiredStep }) {
  const location = useLocation();

  // Check if login has expired (12 hours from login time)
  if (checkLoginExpiry()) {
    // Clear all session data and redirect to login
    clearAllSessionData();
    localStorage.removeItem("currentUser");
    return <Navigate to="/login" replace state={{ expired: true }} />;
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const sessionContext = getSessionContext();

  // Check for valid login - must have currentUser with user_id
  const isLoggedIn = !!(currentUser?.user_id);

  // Check if user_exists flag is set (existing user from backend)
  const isExistingUser = currentUser?.user_exists === true;

  // Existing user is automatically treated as profile complete
  const isProfileComplete = isExistingUser || currentUser?.isProfileComplete === true;

  // Existing user automatically has fields selected
  let isFieldSelected = false;

  if (isExistingUser) {
    isFieldSelected = true;
  } else {
    const raw = sessionStorage.getItem("lastSelection");
    if (raw) {
      try {
        const ls = JSON.parse(raw);
        isFieldSelected =
          !!(ls.branch && ls.field && ls.fromTime && ls.toTime);
      } catch { }
    }
  }


  switch (requiredStep) {
    case "home":
      if (!isLoggedIn) return <Navigate to="/login" replace />;
      return children;

    case "profile":
      if (!isLoggedIn) return <Navigate to="/login" replace />;
      return children;

    case "field":
      if (!isLoggedIn) return <Navigate to="/login" replace />;
      if (!isProfileComplete) return <Navigate to="/user-profile" replace />;
      return children;

    case "learn":
      if (!isLoggedIn) return <Navigate to="/login" replace />;
      if (!isProfileComplete) return <Navigate to="/user-profile" replace />;
      if (!isFieldSelected) return <Navigate to="/field-select" replace />;
      return children;

    default:
      console.error("Unknown ProtectedRoute step:", requiredStep);
      return <Navigate to="/login" replace />;
  }
}
