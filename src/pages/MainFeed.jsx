// src/pages/MainFeed.jsx
import React from 'react';
import NavigationSidebar from '../components/NavigationSideBar';
import ClashFeed from '../components/ClashFeed';  // ClashFeed bileşenini sonradan ekleyeceğiz
import RightSidebar from '../components/RightSidebar';  // Sağ sütun

const MainFeed = () => {
  return (
    <div className="flex">
      <NavigationSidebar />
      <ClashFeed />
      <RightSidebar />
    </div>
  );
};

export default MainFeed;
