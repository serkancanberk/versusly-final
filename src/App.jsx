// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainFeed from "./pages/MainFeed";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainFeed />} />
      </Routes>
    </Router>
  );
}

export default App;
