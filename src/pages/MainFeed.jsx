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
      <div className="flex flex-1 max-w-screen-xl mx-auto">
        {/* Navigation Sidebar - Hidden on mobile */}
        <div className="hidden sm:block sm:w-[320px] lg:w-[18%] flex-shrink-0">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <NavigationSidebar />
          </div>
        </div>

        {/* Center Feed - Scrollable */}
        <div className="w-full sm:w-[60%] lg:w-[55%] border-x border-muted overflow-y-auto">
          <ClashFeed />
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden sm:block sm:w-[320px] lg:w-[27%] flex-shrink-0">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainFeed;
