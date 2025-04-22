// src/pages/MainFeed.jsx
import React from 'react';
import NavigationSidebar from '../components/NavigationSideBar';
import ClashFeed from '../components/ClashFeed';
import RightSidebar from '../components/RightSidebar';
import Header from '../components/Header';

const MainFeed = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bgashwhite">
      {/* Header - Mobile only */}
      <div className="sm:hidden">
        <Header />
      </div>
      
      {/* Main content */}
      <div className="flex flex-1">
        {/* Navigation Sidebar - Hidden on mobile */}
        <div className="hidden sm:block sm:w-1/4">
          <NavigationSidebar />
        </div>

        {/* Center Feed */}
        <div className="w-full sm:w-2/4">
          <ClashFeed />
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden sm:block sm:w-1/4">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default MainFeed;
