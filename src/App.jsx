// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainFeed from "./pages/MainFeed";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8080/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
          }
        })
        .catch(err => console.error("Failed to fetch user:", err));
    }
  }, []);

  const handleLoginSuccess = async (tokenResponse) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: tokenResponse.credential || tokenResponse.access_token })
      });

      if (!res.ok) throw new Error("Failed to authenticate");

      const userData = await res.json();
      setUser(userData.user);
      localStorage.setItem("token", userData.token);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

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
