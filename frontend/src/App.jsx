// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import UserDetails from "./pages/UserDetails";
import FieldSelect from "./pages/FieldSelect";
import Learn from "./pages/Learn";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute requiredStep="profile">
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-details"
          element={
            <ProtectedRoute requiredStep="learn">
              <UserDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/field-select"
          element={
            <ProtectedRoute requiredStep="field">
              <FieldSelect />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learn"
          element={
            <ProtectedRoute requiredStep="learn">
              <Learn />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Home />} />

      </Routes>
    </Router>
  );
}

export default App;
