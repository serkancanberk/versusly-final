// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainFeed from "./pages/MainFeed";
import TagResults from "./components/TagResults";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";

// Helper function to check authentication status
export const checkAuthStatus = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/auth/status", {
      credentials: "include", 
    });
    return res.ok;
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
};

function App() {
  return (
    <GoogleOAuthProvider clientId="1029737867034-qmg1mcdd1h5vpjc6q6riu65rod8pnit4.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          {console.log("🧭 Inside Routes, rendering path:", window.location.pathname)}
          <Routes>
            <Route path="/" element={<MainFeed />} />
            <Route path="/clash/:clashId" element={<MainFeed />} />
            <Route path="/search" element={<MainFeed />} />
            <Route path="/tag/:tagName" element={<MainFeed />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
