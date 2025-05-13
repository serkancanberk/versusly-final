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

const MainFeed = ({ user, setUser }) => {
  const [searchParams] = useSearchParams();
  const { clashId, tagName } = useParams();
  const [forceOpenForm, setForceOpenForm] = useState(false);
  const searchQuery = searchParams.get("q");

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
        <Header user={user} setUser={setUser} />
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 max-w-screen-xl mx-auto">
        {/* Navigation Sidebar - Hidden on mobile */}
        <div className="hidden sm:block sm:w-[320px] lg:w-[18%] flex-shrink-0">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <NavigationSidebar user={user} />
          </div>
        </div>

        {/* Center Feed - Scrollable */}
        <div className="w-full sm:w-[60%] lg:w-[55%] border-x border-muted overflow-y-auto">
          {clashId ? (
            <ClashDetails clashId={clashId} user={user} />
          ) : searchQuery ? (
            <SearchResults user={user} />
          ) : tagName ? (
            <TagResults user={user} />
          ) : (
            <ClashFeed 
              user={user}
              sortBy="newest"
              forceOpenForm={forceOpenForm}
              onFormOpened={handleFormOpened}
            />
          )}
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden sm:block sm:w-[320px] lg:w-[27%] flex-shrink-0">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <RightSidebar 
              user={user} 
              setUser={setUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainFeed;
