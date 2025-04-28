// src/components/Header.jsx
import React, { useState } from "react";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="w-full flex justify-between items-center p-4 bg-white shadow-md z-40">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl text-secondary">⚔️</span>
          <h1 className="text-subheading font-bold text-secondary ml-2">Versusly.co</h1>
        </div>

        {/* Hamburger Menu */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="sm:hidden text-3xl text-secondary"
        >
          ☰
        </button>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}