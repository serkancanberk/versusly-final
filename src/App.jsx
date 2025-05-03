// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainFeed from "./pages/MainFeed";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated via cookies
    fetch("http://localhost:8080/api/auth/me", {
      credentials: "include", // Important: include cookies with the request
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            // User not authenticated, just set loading to false
            return null;
          }
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch user:", err);
        setLoading(false);
      });
  }, []);

  const handleLoginSuccess = async (tokenResponse) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // Important: include cookies with the request
        body: JSON.stringify({ token: tokenResponse.credential || tokenResponse.access_token })
      });

      if (!res.ok) throw new Error("Failed to authenticate");

      const userData = await res.json();
      setUser(userData.user);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <GoogleOAuthProvider clientId="1029737867034-qmg1mcdd1h5vpjc6q6riu65rod8pnit4.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<MainFeed user={user} setUser={setUser} />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
