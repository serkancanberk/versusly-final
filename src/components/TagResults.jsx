import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import NoResultsIllustration from '../assets/no-results-illustration.png';
import ClashCard from "./ClashCard";
import getStatusLabel from "../utils/statusLabel";

const TagResults = ({ user }) => {
  const { tagName } = useParams();
  const [allClashes, setAllClashes] = useState([]);
  const [filteredClashes, setFilteredClashes] = useState([]);
  const [visibleClashes, setVisibleClashes] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allItemsLoaded, setAllItemsLoaded] = useState(false);
  
  const loaderRef = useRef(null);
  const feedRef = useRef(null);
  const CHUNK_SIZE = 5;

  // Fetch clashes matching tag
  const fetchClashes = async () => {
    setIsLoading(true);
    try {
      const url = `http://localhost:8080/api/clashes/tag/${encodeURIComponent(tagName)}`;

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
      setVisibleClashes(transformedData.slice(0, CHUNK_SIZE));
      setHasMore(transformedData.length > CHUNK_SIZE);
    } catch (err) {
      console.error("Error fetching clashes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when tag changes
  useEffect(() => {
    fetchClashes();
  }, [tagName]);

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

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems();
        }
      },
      {
        root: null,
        rootMargin: "300px",
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

  return (
    <div className="min-h-screen bg-muted25 bg-[radial-gradient(circle,_#E0E2DB_1px,_transparent_1px)] bg-[length:12px_12px]" ref={feedRef}>
      {/* Title and description */}
      <div className="px-4 pt-20 pb-1 mb-1">
        <h1 className="text-subheading text-secondary flex items-center gap-2">
          {filteredClashes.length > 0 ? (
            <>🏷️ Tagged with '{tagName}'</>
          ) : (
            <>🤷 No clashes found with tag '{tagName}'</>
          )}
        </h1>
        <p className="text-label text-secondary opacity-50">
          {filteredClashes.length > 0 
            ? `Found ${filteredClashes.length} clash${filteredClashes.length > 1 ? 'es' : ''} with this tag`
            : 'Try a different tag or browse all clashes'}
        </p>
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
                No clashes found with this tag
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

      {/* Loading indicator */}
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

export default TagResults;
