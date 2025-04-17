// src/components/NavigationSideBar.jsx
import React from "react";

const NavigationSideBar = () => {
  return (
    <div className=" w-1/4 p-4 pl-8 h-screen">
      {/* Logo Bölümü */}
      <div className="flex flex-col sm:flex-row items-left mt-20 mb-20">
  <span className="text-heading text-secondary mr-3">⚔️</span>
  <h1 className="text-heading text-secondary font-bold">Versusly.co</h1>
</div>


      {/* Menü Bölümü */}
      <div>
        <ul>
          <li className="mb-9">
            <a href="#" className="px-2 text-sm text-secondary hover:text-alert">
              <span className="mr-4">💣</span> Feed
            </a>
          </li>
          <li className="mb-9">
            <a href="#" className="px-2 text-sm text-secondary hover:text-alert">
              <span className="mr-4">➕</span> New
            </a>
          </li>
          <li className="mb-9">
            <a href="#" className="px-2 text-sm text-secondary hover:text-alert">
              <span className="mr-4">🥷🏻</span> Profile
            </a>
          </li>
          <li className="mb-9">
            <a href="#" className="px-2 text-sm text-secondary hover:text-alert">
              <span className="mr-4">🚩</span> Notifications
            </a>
          </li>
          <li className="mb-9">
            <a href="#" className="px-2 text-sm text-secondary hover:text-alert">
              <span className="mr-4">☠️</span> Stats
            </a>
          </li>
          <li className="mb-9">
            <a href="#" className="px-2 text-sm text-secondary hover:text-alert">
              <span className="mr-4">⚙️</span> Settings
            </a>
          </li>
          <li>
            <a href="#" className="px-2 text-sm text-secondary hover:text-alert">
              <span className="mr-4">🆘</span> Help
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavigationSideBar;
