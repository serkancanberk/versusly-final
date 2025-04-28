import React from "react";

const NavigationSideBar = () => {
  return (
    <div className="h-screen flex flex-col pt-16 pb-5 pl-0 pr-0">
      {/* Logo Bölümü */}
      <div className="flex items-center py-4 mb-10 pl-2">
        <span className="text-subheading text-secondary mr-2">⚔️</span>
        <h1 className="text-subheading text-secondary font-bold">Versusly.co</h1>
      </div>

      {/* Menü Bölümü */}
      <nav className="flex-1">
        <ul className="space-y-5">
          <li>
            <a href="#" className="flex items-center text-secondary hover:text-alert pl-2">
              <span className="inline-block w-6 mr-3">💣</span>
              <span className="text-body">Feed</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center text-secondary hover:text-alert pl-2">
              <span className="inline-block w-6 mr-3">➕</span>
              <span className="text-body">New</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center text-secondary hover:text-alert pl-2">
              <span className="inline-block w-6 mr-3">🥷🏻</span>
              <span className="text-body">Profile</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center text-secondary hover:text-alert pl-2">
              <span className="inline-block w-6 mr-3">🚩</span>
              <span className="text-body">Notifications</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center text-secondary hover:text-alert pl-2">
              <span className="inline-block w-6 mr-3">☠️</span>
              <span className="text-body">Stats</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center text-secondary hover:text-alert pl-2">
              <span className="inline-block w-6 mr-3">⚙️</span>
              <span className="text-body">Settings</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center text-secondary hover:text-alert pl-2">
              <span className="inline-block w-6 mr-3">🆘</span>
              <span className="text-body">Help</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavigationSideBar;
