// src/components/MobileMenu.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function MobileMenu({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white dark:bg-gray-900 z-50 overflow-auto flex flex-col transition-opacity duration-500 opacity-100">
      {/* Header with Logo and Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-muted dark:border-gray-700">
        <div className="flex items-center">
          <span className="text-subheading text-secondary dark:text-gray-300">⚔️</span>
          <h1 className="text-subheading font-bold text-secondary dark:text-gray-300 ml-2">Versusly.co</h1>
        </div>
        <button
          onClick={onClose}
          className="text-xl text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert p-2 rounded-full hover:bg-muted25 dark:hover:bg-gray-800"
        >
          ✖️
        </button>
      </div>

      {/* Search Input - Always Visible */}
      <div className="p-3 border-b border-muted dark:border-gray-700 bg-muted25 dark:bg-gray-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Search clashes..."
            className="w-full px-3 py-2 text-secondary dark:text-gray-300 placeholder:text-secondary/50 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700 border-2 border-primary dark:border-primary rounded-lg pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-2 text-secondary dark:text-gray-300">
            🔍
          </button>
        </div>
      </div>

      {/* Call to Action */}
      <div className="p-4 bg-muted dark:bg-gray-800 border-b border-muted dark:border-gray-700">
        <h2 className="text-subheading text-secondary dark:text-gray-300 mb-2 flex items-center">
          <span className="mr-2">🪂</span>
          <span>Join the Clash</span>
        </h2>
        <p className="text-body text-secondary dark:text-gray-300 ml-7">Hot takes to showdowns — pick a side!</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto pb-safe">
        {/* Navigation Links */}
        <ul className="divide-y divide-muted dark:divide-gray-700">
          <li className="hover:bg-muted25 dark:hover:bg-gray-800">
            <Link to="/signup" onClick={onClose} className="text-body text-secondary dark:text-gray-300 flex items-center p-4">
              <span className="inline-block w-8 mr-3 text-center">➡️</span>
              <span>Sign Up With Google</span>
            </Link>
          </li>
          <li className="hover:bg-muted25 dark:hover:bg-gray-800">
            <Link to="/login" onClick={onClose} className="text-body text-secondary dark:text-gray-300 flex items-center p-4">
              <span className="inline-block w-8 mr-3 text-center">👋</span>
              <span>Login</span>
            </Link>
          </li>
          <li className="hover:bg-muted25 dark:hover:bg-gray-800">
            <Link to="/feed" onClick={onClose} className="text-body text-secondary dark:text-gray-300 flex items-center p-4">
              <span className="inline-block w-8 mr-3 text-center">💣</span>
              <span>Feed</span>
            </Link>
          </li>
          <li className="hover:bg-muted25 dark:hover:bg-gray-800">
            <Link to="/profile" onClick={onClose} className="text-body text-secondary dark:text-gray-300 flex items-center p-4">
              <span className="inline-block w-8 mr-3 text-center">🥷🏻</span>
              <span>Profile</span>
            </Link>
          </li>
          <li className="hover:bg-muted25 dark:hover:bg-gray-800">
            <Link to="/notifications" onClick={onClose} className="text-body text-secondary dark:text-gray-300 flex items-center p-4">
              <span className="inline-block w-8 mr-3 text-center">🚩</span>
              <span>Notifications</span>
            </Link>
          </li>
          <li className="hover:bg-muted25 dark:hover:bg-gray-800">
            <Link to="/stats" onClick={onClose} className="text-body text-secondary dark:text-gray-300 flex items-center p-4">
              <span className="inline-block w-8 mr-3 text-center">☠️</span>
              <span>Stats</span>
            </Link>
          </li>
          <li className="hover:bg-muted25 dark:hover:bg-gray-800">
            <Link to="/settings" onClick={onClose} className="text-body text-secondary dark:text-gray-300 flex items-center p-4">
              <span className="inline-block w-8 mr-3 text-center">⚙️</span>
              <span>Settings</span>
            </Link>
          </li>
          <li className="hover:bg-muted25 dark:hover:bg-gray-800">
            <Link to="/help" onClick={onClose} className="text-body text-secondary dark:text-gray-300 flex items-center p-4">
              <span className="inline-block w-8 mr-3 text-center">🆘</span>
              <span>Help</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Social Media Icons - Fixed Bottom */}
      <div className="border-t border-muted dark:border-gray-700 p-3 bg-white dark:bg-gray-900 fixed bottom-0 w-full">
        <div className="flex justify-center space-x-6 items-center">
          {/* Instagram */}
          <a href="#" className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M16.375 3.25a4.388 4.388 0 0 1 4.375 4.375v8.75a4.388 4.388 0 0 1-4.375 4.375h-8.75a4.389 4.389 0 0 1-4.375-4.375v-8.75A4.388 4.388 0 0 1 7.625 3.25h8.75zm0-1.75h-8.75C4.256 1.5 1.5 4.256 1.5 7.625v8.75c0 3.369 2.756 6.125 6.125 6.125h8.75c3.369 0 6.125-2.756 6.125-6.125v-8.75c0-3.369-2.756-6.125-6.125-6.125z"/>
              <path d="M17.688 7.625a1.313 1.313 0 1 1 0-2.625 1.313 1.313 0 0 1 0 2.625z"/>
              <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0-1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5z"/>
            </svg>
          </a>
          
          {/* YouTube */}
          <a href="#" className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M21.593 7.203a2.506 2.506 0 0 0-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 0 0-1.766 1.778C2 8.83 2 12 2 12s0 3.17.403 4.797a2.506 2.506 0 0 0 1.767 1.763c1.566.433 7.83.44 7.83.44s6.265.007 7.831-.403a2.506 2.506 0 0 0 1.767-1.763C22 15.17 22 12 22 12s0-3.17-.407-4.797zM10 15V9l5.2 3-5.2 3z"/>
            </svg>
          </a>
          
          {/* TikTok */}
          <a href="#" className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.001-.104z"/>
            </svg>
          </a>
          
          {/* LinkedIn */}
          <a href="#" className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
          </a>
          
          {/* Mail */}
          <a href="#" className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}