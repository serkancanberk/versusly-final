import React, { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  console.log("Header component is rendering");  // Bu satırı ekleyin

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Hamburger menüyü açma/kapama fonksiyonu
  };

  return (
    <div className="w-full flex justify-between items-center p-4 bg-white shadow-md z-[9999]">
      {/* Logo */}
      <div className="flex items-center">
        <span className="text-2xl text-secondary">⚔️</span>
        <h1 className="text-xl font-bold text-secondary ml-2">Versusly.co</h1>
      </div>

      {/* Hamburger Menü */}
      <div className="sm:hidden flex items-center">
        <button onClick={toggleMenu} className="text-3xl text-secondary">
          ☰
        </button>
        {isMenuOpen && (
          <div className="absolute top-16 right-4 bg-white p-4 shadow-md">
            <ul className="flex flex-col space-y-4">
              <li><a href="#" className="text-secondary">Feed</a></li>
              <li><a href="#" className="text-secondary">New</a></li>
              <li><a href="#" className="text-secondary">Profile</a></li>
              <li><a href="#" className="text-secondary">Notifications</a></li>
              <li><a href="#" className="text-secondary">Stats</a></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
