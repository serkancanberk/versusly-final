// src/pages/MainFeed.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import NavigationSidebar from '../components/NavigationSidebar';
import ClashFeed from '../components/ClashFeed';
import ClashDetails from '../components/ClashDetails';
import RightSidebar from '../components/RightSidebar';
import Header from '../components/Header';
import SearchResults from '../components/SearchResults';
import TagResults from '../components/TagResults';
import { useAuth } from '../context/AuthContext';
import Profile from '../components/Profile';

const MainFeed = () => {
  const [searchParams] = useSearchParams();
  const { clashId, tagName } = useParams();
  const [forceOpenForm, setForceOpenForm] = useState(false);
  const searchQuery = searchParams.get("q");
  const { user } = useAuth();

  useEffect(() => {
    const handleOpenForm = () => {
      setForceOpenForm(true);
    };

    window.addEventListener("openClashForm", handleOpenForm);
    
    return () => {
      window.removeEventListener("openClashForm", handleOpenForm);
    };
  }, []);

  // Reset forceOpenForm after it's been handled
  const handleFormOpened = () => {
    setForceOpenForm(false);
  };

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
          {searchParams.get("view") === "profile" ? (
            <Profile />
          ) : clashId ? (
            <ClashDetails clashId={clashId} />
          ) : searchQuery ? (
            <SearchResults />
          ) : tagName ? (
            <TagResults tag={tagName} />
          ) : (
            <ClashFeed 
              sortBy="newest"
              forceOpenForm={forceOpenForm}
              onFormOpened={handleFormOpened}
            />
          )}
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
