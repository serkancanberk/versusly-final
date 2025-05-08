// src/pages/MainFeed.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useParams } from 'react-router-dom';
import NavigationSidebar from '../components/NavigationSidebar';
import ClashFeed from '../components/ClashFeed';
import ClashDetails from '../components/ClashDetails';
import RightSidebar from '../components/RightSidebar';
import Header from '../components/Header';

const MainFeed = ({ user, setUser }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { clashId } = useParams();
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [forceOpenForm, setForceOpenForm] = useState(false);

  // Handle search events from both MobileMenu and RightSidebar
  useEffect(() => {
    const handleSearch = (event) => {
      const query = event.detail.query;
      setSearchQuery(query);
    };

    const handleOpenForm = () => {
      setForceOpenForm(true);
    };

    window.addEventListener("searchTriggered", handleSearch);
    window.addEventListener("openClashForm", handleOpenForm);
    
    return () => {
      window.removeEventListener("searchTriggered", handleSearch);
      window.removeEventListener("openClashForm", handleOpenForm);
    };
  }, []);

  // Reset forceOpenForm after it's been handled
  const handleFormOpened = () => {
    setForceOpenForm(false);
  };

  // Initialize tag from both hash and query params
  useEffect(() => {
    const hashTag = location.hash.slice(1); // Remove the # symbol
    const queryTag = searchParams.get("tag");
    
    // Prefer hash tag if both exist
    if (hashTag) {
      setSelectedTag(hashTag);
    } else if (queryTag) {
      setSelectedTag(queryTag);
    } else {
      setSelectedTag(null);
    }
  }, [location.hash, searchParams]);

  // Sync search query with URL
  useEffect(() => {
    if (searchQuery) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set("q", searchQuery);
        return newParams;
      });
    } else {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("q");
        return newParams;
      });
    }
  }, [searchQuery, setSearchParams]);

  const handleTagFilter = (tag) => {
    if (tag) {
      // Update hash for tag navigation
      window.location.hash = tag;
      setSelectedTag(tag);
    } else {
      // Clear hash when removing tag
      window.location.hash = "";
      setSelectedTag(null);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
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
          ) : (
            <ClashFeed 
              selectedTag={selectedTag} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
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
              onTagClick={handleTagFilter} 
              selectedTag={selectedTag} 
              user={user} 
              setUser={setUser}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainFeed;
