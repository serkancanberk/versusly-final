import React, { useState, useEffect, useRef } from "react";
import { GoogleLogin } from "@react-oauth/google";
import debounce from "lodash/debounce";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MAX_RECENT_SEARCHES = 5;

// Tag color mapping
const TAG_COLORS = {
  'Mind Duel': 'bg-yellow-100 text-yellow-800',
  'Pop Arena': 'bg-purple-100 text-purple-800',
  'Tech Talk': 'bg-blue-100 text-blue-800',
  'Food Fight': 'bg-green-100 text-green-800',
  'Sports Showdown': 'bg-red-100 text-red-800',
  'default': 'bg-muted25 text-secondary'
};

const getTagColor = (tag) => {
  return TAG_COLORS[tag] || TAG_COLORS.default;
};

const RightSidebar = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [topTags, setTopTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    setIsClient(true);
    fetchTopTags();
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const fetchTopTags = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/clashes/top-tags");
      const data = await response.json();
      // Ensure we have valid data and sort by count
      const filtered = Array.isArray(data) 
        ? data
            .filter(tag => tag && typeof tag === 'object' && tag.tag && typeof tag.count === 'number')
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        : [];
      setTopTags(filtered);
    } catch (error) {
      console.error("Error fetching top tags:", error);
      setTopTags([]); // Ensure fallback to empty array on error
    } finally {
      setIsLoadingTags(false);
    }
  };

  const handleSearchFocus = () => {
    setShowRecentSearches(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding to allow clicking on recent searches
    setTimeout(() => {
      setShowRecentSearches(false);
    }, 200);
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowRecentSearches(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <div className="h-screen flex flex-col pt-16 pb-5 pl-6 pr-0 overflow-hidden">
      {/* Top Combat Arenas */}
      <div className="mt-16 flex-grow">
        <h2 className="text-subheading text-secondary mb-4">🛡️ Find Tough Clashes</h2>
        {/* Search input with recent searches dropdown */}
        <div className="relative mb-3 group">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search clashes..."
            className="w-full py-2 px-4 text-sm text-secondary bg-muted25 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                if (searchQuery.trim().length >= 3) {
                  setRecentSearches(prev => {
                    const newSearches = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, MAX_RECENT_SEARCHES);
                    localStorage.setItem("recentSearches", JSON.stringify(newSearches));
                    return newSearches;
                  });
                }
                setShowRecentSearches(false);
              }
            }}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onDoubleClick={(e) => e.target.select()}
          />
          <div className="absolute right-2 top-2 text-secondary cursor-pointer">
            {searchQuery.length > 0 ? (
              <span onClick={() => {
                setSearchQuery("");
                navigate("/");
              }}>✖</span>
            ) : (
              "🔍"
            )}
          </div>
          
          {/* Recent searches dropdown */}
          {showRecentSearches && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50 border border-muted">
              <div className="p-2 border-b border-muted flex justify-between items-center">
                <span className="text-xs text-mutedDark">Recent searches</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-mutedDark hover:text-alert"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((query, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm text-secondary hover:bg-muted25 flex items-center gap-2"
                  onClick={() => handleRecentSearchClick(query)}
                >
                  <span className="text-mutedDark">🔍</span>
                  {query}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Dynamic Tags */}
        <div className="flex flex-wrap gap-3 mt-4 mb-2">
          {isLoadingTags ? (
            <div className="w-full text-center text-mutedDark">Loading tags...</div>
          ) : topTags.length === 0 ? (
            <div className="w-full text-center text-mutedDark">No tags available</div>
          ) : (
            topTags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => {
                  if (selectedTag === tag) {
                    setSelectedTag(null);
                    navigate("/");
                  } else {
                    setSelectedTag(tag);
                    navigate(`/tag/${encodeURIComponent(tag)}`);
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-caption hover:shadow-md hover:bg-opacity-75 transition-colors ${
                  getTagColor(tag)
                } ${selectedTag === tag ? 'ring-2 ring-accent scale-[1.05]' : ''}`}
                title={`${count} clashes`}
              >
                {tag}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Join the Clash */}
      <div className="mt-auto pt-4">
        <h2 className="text-subheading text-secondary mb-2">🪂 Join the Clash</h2>
        <p className="text-label text-muted-dark mb-4">
          From hot takes to showdowns — pick a side and make it count.
        </p>
        {user ? (
          <div className="relative md:sticky top-4 bg-white p-4 rounded-lg shadow-lg border border-muted mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={user?.picture || "/default-avatar.png"}
                alt={user?.name || "User Avatar"}
                className="w-10 h-10 rounded-full ring-2 ring-accent object-cover"
              />
              <div>
                <p className="font-semibold text-body">{user.name}</p>
                <p className="text-caption text-mutedDark">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="w-full text-center py-2 mt-3 bg-muted25/75 text-mutedDark text-label rounded-md hover:bg-muted25 hover:scale-105 active:scale-95 transition transform"
            >
              💀 Sign Out
            </button>
          </div>
        ) : (
          <div className="mt-4 mb-4 w-full flex justify-center">
            {isClient && (
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const token = credentialResponse.credential;
                  fetch("http://localhost:8080/api/auth/google", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ token }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      setUser(data.user);
                    })
                    .catch(() => {});
                }}
                onError={() => {}}
                size="large"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
