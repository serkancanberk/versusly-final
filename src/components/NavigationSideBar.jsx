// src/components/NavigationSideBar.jsx
import React from "react";

const NavigationSideBar = () => {
  return (
    <div className="w-[310px] bg-zinc-100 dark:bg-zinc-800 p-4 pl-8 h-screen">
      {/* Logo Bölümü */}
      <div className="flex items-center mt-20 mb-20">
        <span className="text-4xl mr-3">⚔️</span>
        <h1 className="text-2xl font-bold text-secondary">Versusly.co</h1>
      </div>

      {/* Menü Bölümü */}
      <div>
        <ul>
          <li className="mb-9">
            <a href="#" className="text-sm text-secondary hover:text-primary">
              <span className="mr-2">💣</span> Feed
            </a>
          </li>
          <li className="mb-9">
            <a href="#" className="text-sm text-secondary hover:text-primary">
              <span className="mr-2">➕</span> New
            </a>
          </li>
          <li className="mb-9">
            <a href="#" className="text-sm text-secondary hover:text-primary">
              <span className="mr-2">🥷🏻</span> Profile
            </a>
          </li>
          <li className="mb-9">
            <a href="#" className="text-sm text-secondary hover:text-primary">
              <span className="mr-2">🚩</span> Notifications
            </a>
          </li>
          <li className="mb-9">
            <a href="#" className="text-sm text-secondary hover:text-primary">
              <span className="mr-2">☠️</span> Stats
            </a>
          </li>
          <li className="mb-9">
            <a href="#" className="text-sm text-secondary hover:text-primary">
              <span className="mr-2">⚙️</span> Settings
            </a>
          </li>
          <li>
            <a href="#" className="text-sm text-secondary hover:text-primary">
              <span className="mr-2">🆘</span> Help
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavigationSideBar;
