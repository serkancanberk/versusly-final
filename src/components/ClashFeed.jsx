import React, { useState, useEffect, useRef } from "react";
import NoResultsIllustration from '../assets/no-results-illustration.png';
import ClashCard from "./ClashCard";
import ClashForm from "./ClashForm";
import { useNavigate } from "react-router-dom";
import getStatusLabel from "../utils/statusLabel";

const ClashFeed = ({ user, forceOpenForm, onFormOpened }) => {
  const navigate = useNavigate();
  const [allClashes, setAllClashes] = useState([]); // Store all clashes
  const [filteredClashes, setFilteredClashes] = useState([]); // Store filtered clashes
  const [visibleClashes, setVisibleClashes] = useState([]); // Store visible clashes for pagination
  const [isLoading, setIsLoading] = useState(false);
  const CHUNK_SIZE = 5; // Number of clashes to show initially and load more

  // Filter by dropdown için state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState("all"); // default: all
  const sortMenuRef = useRef(null);

  // State for share toast
  const [showShareToast, setShowShareToast] = useState(false);

  // Fetch clashes
  const fetchClashes = async () => {
    setIsLoading(true);
    try {
      const url = "http://localhost:8080/api/clashes";

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

      setAllClashes(transformedData);
      setFilteredClashes(transformedData);
    } catch (err) {
      console.error("Error fetching clashes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchClashes();
  }, []);

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
    setVisibleClashes(filtered.slice(0, CHUNK_SIZE)); // Set initial visible clashes
  }, [sortOption, allClashes]);

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

  // Filter by dropdown'ı aç/kapat
  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  // Sort seçeneğini ayarla
  const handleSortOptionChange = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

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

  // Handle load more
  const handleLoadMore = () => {
    const nextClashes = filteredClashes.slice(0, visibleClashes.length + CHUNK_SIZE);
    setVisibleClashes(nextClashes);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-muted25 bg-[radial-gradient(circle,_#E0E2DB_1px,_transparent_1px)] bg-[length:12px_12px]">
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
      </section>

      {/* Feed Section */}
      <section className="bg-bgashwhite">
        {/* Sort dropdown and options */}
        <div className="p-8 flex justify-between items-center border-t border-muted">
          <h2 className="text-body text-secondary flex items-center gap-2">
            🔥 Highlighted Clashes
          </h2>
          <div className="relative" ref={sortMenuRef}>
            <button 
              className="flex items-center space-x-1 text-caption text-mutedDark hover:text-secondary"
              onClick={toggleSortDropdown}
              title="Filter clashes"
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
        <div className="space-y-6 px-4">
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
                  />
                </div>
              ) : null;
            })
          ) : (
            <div className="text-center py-12">
              <img
                src={NoResultsIllustration}
                alt="No results"
                className="w-48 h-48 mx-auto mb-4"
              />
              <p className="text-label text-secondary opacity-50">
                No clashes found. Be the first to start a clash!
              </p>
            </div>
          )}

          {/* Load More Button */}
          {visibleClashes.length < filteredClashes.length && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 bg-secondary text-white rounded-md text-caption hover:bg-secondary/80 transition"
              >
                Show more
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <section className="bg-bgashwhite border-t border-muted">
        {visibleClashes.length > 0 && (
          <div className="text-center text-label text-mutedDark py-8 pb-20">
            Showing {visibleClashes.length} of {allClashes.length} clash{allClashes.length > 1 ? "es" : ""}
          </div>
        )}
      </section>
    </div>
  );
};

export default ClashFeed;