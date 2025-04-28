// src/components/MobileMenu.jsx
import React, { useState } from "react";

export default function MobileMenu({ isOpen, onClose }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white z-50 overflow-auto p-4 transition-opacity duration-500 opacity-100">
      {/* Üst Logo ve Kapatma Butonu */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <span className="text-subheading text-secondary">⚔️</span>
          <h1 className="text-subheading font-bold text-secondary ml-2">Versusly.co</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search Icon */}
          <button
            onClick={toggleSearch}
            className="text-subheading text-secondary hover:text-mutedDark"
          >
            🔍
          </button>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-3xl text-secondary hover:text-alert"
          >
            ✖️
          </button>
        </div>
      </div>

      {/* Eğer searchOpen true ise arama kutusu */}
      {searchOpen && (
        <div className="mb-4 p-2">
          <input
            type="text"
            placeholder="Search clashes..."
            className="w-full mb-2 px-4 py-2 text-secondary placeholder-opacity-50 bg-white border-b-2 border-primary shadow-md rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Üstteki Call to Action */}
      <div className="mb-2 p-2">
        <h2 className="text-subheading text-secondary mb-2">🪂 Join the Clash</h2>
        <p className="text-body text-secondary mb-4">Hot takes to showdowns — pick a side!</p>
      </div>

      {/* Navigasyon Linkleri */}
      <ul className="divide-y divide-muted25 space-y-6 p-2">
        <li className="pt-2"><a href="#" className="text-body text-secondary flex items-center"><span className="mr-3">➡️</span> Sign Up With Google</a></li>
        <li className="pt-2"><a href="#" className="text-body text-secondary flex items-center"><span className="mr-3">👋</span> Login</a></li>
        <li className="pt-2"><a href="#" className="text-body text-secondary flex items-center"><span className="mr-3">💣</span> Feed</a></li>
        <li className="pt-2"><a href="#" className="text-body text-secondary flex items-center"><span className="mr-3">🥷🏻</span> Profile</a></li>
        <li className="pt-2"><a href="#" className="text-body text-secondary flex items-center"><span className="mr-3">🚩</span> Notifications</a></li>
        <li className="pt-2"><a href="#" className="text-body text-secondary flex items-center"><span className="mr-3">☠️</span> Stats</a></li>
        <li className="pt-2"><a href="#" className="text-body text-secondary flex items-center"><span className="mr-3">⚙️</span> Settings</a></li>
        <li className="pt-2"><a href="#" className="text-body text-secondary flex items-center"><span className="mr-3">🆘</span> Help</a></li>
      </ul>
    </div>
  );
}