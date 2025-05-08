// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import MobileMenu from "./MobileMenu";
import { Link } from "react-router-dom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shouldFocusSearch, setShouldFocusSearch] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 z-40 transition-all duration-300 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl text-secondary dark:text-gray-300">⚔️</span>
          <h1 className="text-subheading font-bold text-secondary dark:text-gray-300 ml-2">Versusly.co</h1>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Search button - only visible on mobile */}
          <button
            onClick={() => {
              setIsMenuOpen(true);
              setShouldFocusSearch(true);
            }}
            className="sm:hidden text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert"
            aria-label="Open search"
          >
            🔍
          </button>
          
          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="sm:hidden text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert p-2 rounded-lg hover:bg-muted25 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Add padding to prevent content from hiding under fixed header */}
      <div className="h-16"></div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={!!isMenuOpen}
        onClose={() => {
          setIsMenuOpen(false);
          setShouldFocusSearch(false);
        }}
        focusSearchOnOpen={shouldFocusSearch}
      />
    </>
  );
}