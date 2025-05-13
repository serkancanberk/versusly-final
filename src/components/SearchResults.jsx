import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import NoResultsIllustration from '../assets/no-results-illustration.png';
import ClashCard from "./ClashCard";
import getStatusLabel from "../utils/statusLabel";

const SearchResults = ({ user }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';

  const [allClashes, setAllClashes] = useState([]);
  const [filteredClashes, setFilteredClashes] = useState([]);
  const [visibleClashes, setVisibleClashes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const loaderRef = useRef(null);
  const CHUNK_SIZE = 5;

  // Fetch clashes matching search query
  const fetchClashes = async () => {
    setIsLoading(true);
    try {
      const url = `http://localhost:8080/api/clashes/search?q=${encodeURIComponent(searchQuery)}`;

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
          creator: item.creator && typeof item.creator === "object"
            ? {
                name: item.creator.name || "Unknown",
                picture: item.creator.picture || "",
                email: item.creator.email || ""
              }
            : {
                name: "Unknown",
                picture: "",
                email: ""
              },
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
    } catch (err) {
      console.error("Error fetching clashes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when search query changes
  useEffect(() => {
    fetchClashes();
  }, [searchQuery]);

  // Add IntersectionObserver effect
  useEffect(() => {
    if (!loaderRef.current || visibleClashes.length >= filteredClashes.length) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsLoadingMore(true);
        setTimeout(() => {
          const nextClashes = filteredClashes.slice(0, visibleClashes.length + CHUNK_SIZE);
          setVisibleClashes(nextClashes);
          setIsLoadingMore(false);
        }, 1000); // Extended delay for better visual feedback
      }
    });

    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [visibleClashes, filteredClashes]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-muted25 bg-[radial-gradient(circle,_#E0E2DB_1px,_transparent_1px)] bg-[length:12px_12px] pt-20 pb-4 border-b border-muted">
        <div className="px-4">
          <h1 className="text-subheading text-secondary flex items-center gap-2">
            {filteredClashes.length > 0 ? (
              <>🔍 Search results for "{searchQuery}"</>
            ) : (
              <>🤷 No clashes found for "{searchQuery}"</>
            )}
          </h1>
          <p className="text-label text-secondary opacity-50">
            {filteredClashes.length > 0 
              ? `Found ${filteredClashes.length} clash${filteredClashes.length > 1 ? 'es' : ''} matching your search`
              : 'Try different keywords or browse all clashes'}
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="mt-4 text-label text-accent underline hover:opacity-80 transition-opacity"
          >
            ← Back to main feed
          </button>
        </div>
      </section>

      {/* Feed Section */}
      <section className="bg-bgashwhite px-4 space-y-6 mt-8">
        {Array.isArray(visibleClashes) && visibleClashes.length > 0 ? (
          visibleClashes.map((clash) => {
            return clash && clash._id ? (
              <div 
                key={clash._id} 
                className="mb-10 pb-6 opacity-0 animate-[fadeIn_0.8s_ease-in-out_forwards]"
              >
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
            <div className="space-y-6">
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
                🤔 Hmm... Nothing sparked a clash this time. <br />
                Why not start one yourself?
              </div>
              <button
                onClick={() => window.location.href = "/"}
                className="mt-2 text-label text-accent underline hover:opacity-80 transition-opacity"
              >
                🚀 Start a new clash
              </button>
            </div>
          )
        )}

        {/* Infinite scroll loader */}
        {visibleClashes.length < filteredClashes.length && (
          <div
            ref={loaderRef}
            className="text-center py-8 text-caption text-mutedDark flex flex-col items-center justify-center space-y-2"
          >
            <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-mutedDark"></span>
            <span>Loading more clashes...</span>
          </div>
        )}
      </section>

      {/* Footer Section */}
      <section className="bg-bgashwhite border-t border-muted py-8 pb-20">
        {visibleClashes.length > 0 && (
          <div className="text-center text-label text-mutedDark">
            Showing {visibleClashes.length} of {allClashes.length} clash{allClashes.length > 1 ? "es" : ""}
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchResults;
