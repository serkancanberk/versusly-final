// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainFeed from "./pages/MainFeed";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("versusly_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetch("http://localhost:8080/api/auth/me", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem("versusly_user", JSON.stringify(data.user));
          }
        })
        .catch((err) => console.error("Failed to fetch user:", err));
    }
  }, []);

  const handleLoginSuccess = async (tokenResponse) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ access_token: tokenResponse.access_token })
      });

      if (!res.ok) throw new Error("Failed to authenticate");

      const userData = await res.json();
      setUser(userData);
      localStorage.setItem("versusly_user", JSON.stringify(userData));
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
