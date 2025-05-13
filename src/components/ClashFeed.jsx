import React, { useState, useEffect, useRef } from "react";
import NoResultsIllustration from '../assets/no-results-illustration.png';
import ClashCard from "./ClashCard";
import ClashForm from "./ClashForm";
import { useNavigate } from "react-router-dom";
import getStatusLabel from "../utils/statusLabel";
import { sanitizeInput, formatGPTResponse, generatePromptFromForm } from "../utils/gptUtils.js";

const ClashFeed = ({ selectedTag, searchQuery, user, forceOpenForm, onFormOpened }) => {
  const navigate = useNavigate();
  const [allClashes, setAllClashes] = useState([]); // Store all clashes
  const [filteredClashes, setFilteredClashes] = useState([]); // Store filtered clashes
  const [visibleClashes, setVisibleClashes] = useState([]); // Store currently visible clashes
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const feedRef = useRef(null);
  const CHUNK_SIZE = 5; // Number of items to load at once
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Filter by dropdown için state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState("all"); // default: all
  const sortMenuRef = useRef(null);

  // New state for loading feedback
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // New state for completion feedback
  const [allItemsLoaded, setAllItemsLoaded] = useState(false);

  // Fetch tag count when tag is selected
  const [tagCount, setTagCount] = useState(null);

  // State for share toast
  const [showShareToast, setShowShareToast] = useState(false);

  // Handle focus after search
  useEffect(() => {
    if (searchQuery && feedRef.current) {
      // Small delay to ensure the mobile menu is closed
      setTimeout(() => {
        feedRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    }
  }, [searchQuery]);

  // Fetch clashes based on search query or tag
  const fetchClashes = async () => {
    setIsLoading(true);
    try {
      console.log("searchQuery", searchQuery); // Add logging to debug searchQuery
      let url = "http://localhost:8080/api/clashes";
      if (selectedTag) {
        url = `http://localhost:8080/api/clashes?tag=${encodeURIComponent(selectedTag)}`;
      }

      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError);
        setIsLoading(false);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("API response is not an array:", data);
        setIsLoading(false);
        return;
      }

      const transformedData = data.map(item => {
        const argumentCount = Array.isArray(item.Clash_arguments) ? item.Clash_arguments.length : 0;

        return {
          ...item,
          _id: String(item._id),
          vs_title: item.vs_title || item.title || "",
          vs_statement: item.vs_statement || item.statement || "",
          vs_argument: item.vs_argument || item.argument || "",
          Clash_arguments: item.Clash_arguments || [],
          argumentCount,
          creator: typeof item.creator === "object" && item.creator !== null ? item.creator : null,
          statusLabel: getStatusLabel({ 
            createdAt: item.createdAt, 
            expires_at: item.expires_at, 
            argumentCount, 
            reactions: item.reactions 
          })
        };
      }).filter(item => item.vs_title && item.vs_statement);

      // Always apply frontend-level filter if searchQuery exists
      let filteredData = transformedData;
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredData = transformedData.filter(item =>
          item.vs_title.toLowerCase().includes(lowerQuery) ||
          item.vs_statement.toLowerCase().includes(lowerQuery) ||
          (Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
      }

      setAllClashes(filteredData);
      setFilteredClashes(filteredData);
      setVisibleClashes(filteredData.slice(0, CHUNK_SIZE));
      setHasMore(filteredData.length > CHUNK_SIZE);
    } catch (err) {
      console.error("Error fetching clashes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update clashes when search query or tag changes
  useEffect(() => {
    fetchClashes();
  }, [searchQuery, selectedTag]);

  // Filter clashes based on sortOption
  useEffect(() => {
    let filtered = [...allClashes];
    
    switch (sortOption) {
      case "hot":
        filtered = allClashes.filter(clash => clash.statusLabel === "hot");
        break;
      case "new":
        filtered = allClashes.filter(clash => clash.statusLabel === "new");
        break;
      case "finished":
        filtered = allClashes.filter(clash => clash.statusLabel === "finished");
        break;
      case "all":
      default:
        // Sort all clashes by status: hot -> new -> finished
        filtered.sort((a, b) => {
          const statusOrder = { hot: 0, new: 1, finished: 2 };
          return statusOrder[a.statusLabel] - statusOrder[b.statusLabel];
        });
        break;
    }

    setFilteredClashes(filtered);
    setOffset(0); // Reset offset when filter changes
    setVisibleClashes(filtered.slice(0, CHUNK_SIZE)); // Show first chunk
    setHasMore(filtered.length > CHUNK_SIZE); // Update hasMore based on remaining items
  }, [sortOption, allClashes]);

  // Load more items when scrolling
  const loadMoreItems = async () => {
    if (!hasMore || isLoading || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextOffset = offset + CHUNK_SIZE;
    const nextItems = filteredClashes.slice(nextOffset, nextOffset + CHUNK_SIZE);
    
    if (nextItems.length > 0) {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter out any potential duplicates
      setVisibleClashes(prev => {
        const existingIds = new Set(prev.map(item => item._id));
        const newItems = nextItems.filter(item => !existingIds.has(item._id));
        return [...prev, ...newItems];
      });
      
      setOffset(nextOffset);
      const hasMoreItems = nextOffset + CHUNK_SIZE < filteredClashes.length;
      setHasMore(hasMoreItems);
      setAllItemsLoaded(!hasMoreItems);
    } else {
      setHasMore(false);
      setAllItemsLoaded(true);
    }
    
    setIsLoadingMore(false);
  };

  // Intersection Observer setup with adjusted sensitivity
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems();
        }
      },
      {
        root: null,
        rootMargin: "300px", // Increased margin for earlier trigger
        threshold: 0.1,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, offset, filteredClashes]);

  // Handle clicks outside the sort dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target)
      ) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortDropdown]);

  // Reset loading states when filter changes
  useEffect(() => {
    setAllItemsLoaded(false);
    setIsLoadingMore(false);
  }, [sortOption]);

  // Initial fetch
  useEffect(() => {
    fetchClashes();
    // eslint-disable-next-line
  }, []);

  // Tag filter handler
  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
    fetchClashes();
  };

  // Filter by dropdown'ı aç/kapat
  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  // Sort seçeneğini ayarla
  const handleSortOptionChange = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

  // Fetch tag count when tag is selected
  useEffect(() => {
    if (selectedTag) {
      fetch(`http://localhost:8080/api/clashes/top-tags`)
        .then(res => res.json())
        .then(tags => {
          const tag = tags.find(t => t.tag === selectedTag);
          setTagCount(tag?.count || 0);
        })
        .catch(err => console.error("Error fetching tag count:", err));
    } else {
      setTagCount(null);
    }
  }, [selectedTag]);

  // Share handler
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // Handle new clash creation
  const handleClashCreated = (newClash) => {
    setAllClashes(prev => [newClash, ...prev.filter(item => String(item._id) !== String(newClash._id))]);
  };

  return (
    <div className="min-h-screen bg-muted25 bg-[radial-gradient(circle,_#E0E2DB_1px,_transparent_1px)] bg-[length:12px_12px]" ref={feedRef}>
      {/* Title and description above feed */}
      <div className="px-4 pt-20 pb-1 mb-1">
        <h1 className="text-subheading text-secondary flex items-center gap-2">
          🔥 Clash Starts Here.
        </h1>
        <p className="text-label text-secondary opacity-50">
          Your bold statement meets its rival. AI scores both sides. The crowd decides.
        </p>
      </div>

      {/* Share toast */}
      {showShareToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-secondary text-white px-4 py-2 rounded-full shadow-lg z-50">
          Link copied!
        </div>
      )}

      {/* ClashForm component */}
      <ClashForm
        user={user}
        forceOpenForm={forceOpenForm}
        onFormOpened={onFormOpened}
        onClashCreated={handleClashCreated}
      />

      {/* Sort dropdown and options */}
      <div className="p-8 flex bg-bgashwhite justify-between items-center border-t border-muted mt-6">
        <h2 className="text-body text-secondary flex items-center gap-2">
          {searchQuery
            ? <>
                🔍 {filteredClashes.length} clash{filteredClashes.length !== 1 ? "es" : ""} found for
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-secondary border border-muted text-label">
                  "{searchQuery}"
                  <button
                    onClick={() => window.location.href = "/"} // or use setSearchQuery("") if available
                    className="text-mutedDark hover:text-alert transition-colors"
                    title="Clear search"
                  >
                    ✖
                  </button>
                </span>
              </>
            : selectedTag
            ? `🏷️ ${filteredClashes.length} clash${filteredClashes.length !== 1 ? "es" : ""} tagged with "${selectedTag}"`
            : "🔥 Highlighted Clashes"}
        </h2>
        <div className="relative" ref={sortMenuRef}>
          <button 
            className={`flex items-center space-x-1 text-caption ${
              searchQuery || selectedTag ? "text-mutedDark opacity-50 cursor-not-allowed" : "text-mutedDark hover:text-secondary"
            }`}
            onClick={searchQuery || selectedTag ? null : toggleSortDropdown}
            disabled={searchQuery || selectedTag}
            title={searchQuery || selectedTag ? "Clear your search to filter" : "Filter clashes"}
          >
            <span>Filter by:</span>
            <span className="font-medium text-secondary">
              {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
            </span>
            <span className="text-xs">▼</span>
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-20 w-36">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange("all")}
              >
              ⚔️ All
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange("hot")}
              >
              🤯 Hot
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange("new")}
              >
               ⚡ New
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange("finished")}
              >
                ⏰ Finished
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clash list */}
      <div className="space-y-6 px-4 bg-bgashwhite">
        {Array.isArray(visibleClashes) && visibleClashes.length > 0 ? (
          visibleClashes.map((clash) => {
            return clash && clash._id ? (
              <div key={clash._id} className="mb-10 pb-6">
                <ClashCard
                  _id={clash._id}
                  vs_title={clash.vs_title}
                  vs_statement={clash.vs_statement}
                  argument={clash.vs_argument || (clash.Clash_arguments?.[0]?.text || "")}
                  Clash_arguments={clash.Clash_arguments || []}
                  reactions={clash.reactions}
                  tags={clash.tags}
                  expires_at={clash.expires_at}
                  createdAt={clash.createdAt}
                  creator={clash.creator}
                  user={user}
                  onTagClick={handleTagFilter}
                />
              </div>
            ) : null;
          })
        ) : (
          isLoading ? (
            <div className="space-y-6 px-4 bg-bgashwhite">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-48 bg-muted25 rounded-2xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center">
              <img
                src={NoResultsIllustration}
                alt="No results"
                className="w-40 h-40 mb-4 opacity-80"
              />
              <div className="text-label text-mutedDark mb-2">
                {searchQuery ? (
                  <>
                    Hmm... we couldn't find any clash for <strong>"{searchQuery}"</strong>
                    {selectedTag && (
                      <span> under the tag <strong>"{selectedTag}"</strong></span>
                    )}. Maybe start one?
                  </>
                ) : selectedTag ? (
                  <>
                    Nothing here yet under the tag <strong>"{selectedTag}"</strong>. Be the first to start a clash!
                  </>
                ) : (
                  "It's a little quiet here. How about launching the very first clash?"
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Clash count info */}
      {filteredClashes.length > 0 && (
        <div className="text-center text-label text-mutedDark py-2">
          Showing {visibleClashes.length} of {filteredClashes.length} clash{filteredClashes.length > 1 ? "es" : ""}
        </div>
      )}

      {/* Loading indicator with enhanced feedback */}
      {(hasMore || allItemsLoaded) && (
        <div 
          ref={loaderRef} 
          className="p-4 text-center text-label text-mutedDark"
        >
          {isLoadingMore ? (
            "Loading more clashes..."
          ) : allItemsLoaded ? (
            "✅ All clashes loaded"
          ) : (
            "Scroll for more"
          )}
        </div>
      )}
    </div>
  );
};

export default ClashFeed;