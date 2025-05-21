import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaThumbsUp, FaComment, FaTag } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ClashAuthorInfo from './ClashAuthorInfo';
import ReactionPanel from './ReactionPanel';
import ClashArgumentsDisplay from './ClashArgumentsDisplay';
import { Link } from 'react-router-dom';
import ClashShare from './ClashShare';
import ClashDropdownMenu from './ClashDropdownMenu';
import ClashContentPreview from './ClashContentPreview';
import ArgumentsList from './ArgumentsList';
import getStatusLabel from '../utils/statusLabel';
import { extractSideLabelsFromTitle } from '../utils/parseSides';
import ClashVotingBar from './ClashVotingBar';
import ArgumentSubmissionForm from './ArgumentSubmissionForm';
import SimilarClashes from './SimilarClashes';

// Component stubs - these will be implemented as separate components later
const ClashImageBanner = () => (
  <div className="w-full h-64 bg-gray-200 rounded-lg mb-6">
    <div className="w-full h-full flex items-center justify-center text-gray-500">
      Clash Banner Image
    </div>
  </div>
);

const UserMetaInfo = ({ clash, argumentCount }) => (
  <div className="flex items-center justify-between mb-6">
    <ClashAuthorInfo creator={clash?.creator} createdAt={clash?.createdAt} />
    <div className="flex items-center space-x-4">
      <ReactionPanel clashId={clash._id} reactions={clash.reactions} />
      <Link to="#arguments-section">
        <ClashArgumentsDisplay count={argumentCount} />
      </Link>
      <ClashShare clashId={clash._id} />
      <ClashDropdownMenu clashId={clash._id} />
    </div>
  </div>
);

const ClashMetadata = ({ clash }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold mb-4">{clash?.vs_title || 'Clash Title'}</h1>
    <p className="text-lg text-gray-700 mb-4">{clash?.vs_statement || 'Main statement about the clash...'}</p>
    <div className="flex flex-wrap gap-2">
      {(clash?.tags || ['tag1', 'tag2']).map((tag, index) => (
        <span
          key={index}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);


export default function ClashDetails({ clashId }) {
  const [clash, setClash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarClashes, setSimilarClashes] = useState([]);
  const [similarClashesLoading, setSimilarClashesLoading] = useState(false);
  const [similarClashesError, setSimilarClashesError] = useState(null);
  const { user } = useAuth();
  const hasScrolledRef = useRef(false);

  // Modified useEffect for handling scroll to arguments section
  useEffect(() => {
    const scrollToArguments = () => {
      if (window.location.hash === '#arguments-section' && !hasScrolledRef.current) {
        const argumentsSection = document.getElementById('arguments-section');
        if (argumentsSection) {
          argumentsSection.scrollIntoView({ behavior: 'smooth' });
          hasScrolledRef.current = true;
        }
      }
    };

    // Initial scroll attempt
    scrollToArguments();

    // Set up a MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      scrollToArguments();
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
      hasScrolledRef.current = false; // Reset the ref when component unmounts
    };
  }, []); // Remove clash dependency since we don't need to re-run on clash updates

  const fetchClash = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clashes/${clashId}?includeArguments=false`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Fetch arguments separately from /api/arguments
      const argumentsRes = await fetch(`/api/arguments?clashId=${clashId}`);
      const argumentsData = await argumentsRes.json();
      data.Clash_arguments = argumentsData;

      const argumentCount = Array.isArray(data.Clash_arguments) ? data.Clash_arguments.length : 0;
      data.statusLabel = getStatusLabel({
        createdAt: data.createdAt,
        expires_at: data.expires_at,
        argumentCount,
        reactions: data.reactions
      });
      setClash(data);
      console.log("🧩 ClashDetails fetched clash:", data);
      console.log("🧪 First Argument Sample:", data.Clash_arguments?.[0]);
    } catch (err) {
      setError(err.message || 'Failed to fetch clash details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarClashes = async () => {
    try {
      setSimilarClashesLoading(true);
      setSimilarClashesError(null);

      const response = await fetch(`/api/clashes/${clashId}/similar`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("📎 SimilarClashes data fetched:", data);
      setSimilarClashes(data);
    } catch (err) {
      setSimilarClashesError(err.message || 'Failed to fetch similar clashes');
    } finally {
      setSimilarClashesLoading(false);
    }
  };

  useEffect(() => {
    if (!clashId) {
      setLoading(false);
      setSimilarClashesLoading(false);
      return;
    }

    fetchClash();
    fetchSimilarClashes();

    return () => {
      setClash(null);
      setError(null);
      setSimilarClashes([]);
      setSimilarClashesError(null);
    };
  }, [clashId]);

  if (!clashId) {
    return <div className="p-4 text-secondary">No clash selected</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-alert">
        <p>Error loading clash: {error}</p>
      </div>
    );
  }

  if (!clash) {
    return (
      <div className="p-4 text-secondary">
        Clash not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ClashImageBanner />
        <UserMetaInfo clash={clash} argumentCount={clash?.Clash_arguments?.length || 0} />
        <ClashContentPreview
          title={clash.vs_title}
          statement={clash.vs_statement}
          statusLabel={clash.statusLabel || "active"}
          expires_at={clash.expires_at}
          tags={clash.tags}
        />

        {/* Calculate vote distribution */}
        {(() => {
          const voteArray = clash?.votes ?? [];
          
          const sideAcount = voteArray.filter(v => v.side === 'for').length;
          const sideBcount = voteArray.filter(v => v.side === 'against').length;
          const neutralCount = voteArray.filter(v => v.side === 'neutral').length;
          
          const totalVotes = sideAcount + sideBcount + neutralCount;
          
          const voteDistribution = {
            sideA: totalVotes > 0 ? Math.round((sideAcount / totalVotes) * 100) : 0,
            sideB: totalVotes > 0 ? Math.round((sideBcount / totalVotes) * 100) : 0,
            neutral: totalVotes > 0 ? Math.round((neutralCount / totalVotes) * 100) : 0
          };
          
          const voteCounts = {
            sideA: sideAcount,
            sideB: sideBcount,
            neutral: neutralCount
          };
          
          return (
            <ClashVotingBar 
              votes={voteCounts}
              voteDistribution={voteDistribution}
              sideLabels={
                clash.sideLabels || {
                  sideA: { label: 'Side A', value: 'for' },
                  sideB: { label: 'Side B', value: 'against' },
                  neutral: { label: 'Neutral', value: 'neutral' }
                }
              }
            />
          );
        })()}
        
        {user && (
          <ArgumentSubmissionForm
            clashId={clash._id}
            sideLabels={clash.sideLabels || {
              sideA: { label: 'Side A', value: 'for' },
              sideB: { label: 'Side B', value: 'against' },
              neutral: { label: 'Neutral', value: 'neutral' }
            }}
            onArgumentSubmitted={(newArgument) => {
              setClash(prevClash => {
                // Ensure the new argument has the correct structure
                const formattedArgument = {
                  ...newArgument,
                  user: newArgument.user || {
                    _id: user._id,
                    name: user.name,
                    picture: user.picture
                  }
                };

                const updatedArguments = [formattedArgument, ...(prevClash.Clash_arguments || [])];

                const updatedVotes = newArgument.voteRecorded
                  ? [...(prevClash.votes || []), {
                      userId: user._id,
                      side: newArgument.side.value,
                      timestamp: new Date()
                    }]
                  : prevClash.votes;

                const sideAcount = updatedVotes.filter(v => v.side === 'for').length;
                const sideBcount = updatedVotes.filter(v => v.side === 'against').length;
                const neutralCount = updatedVotes.filter(v => v.side === 'neutral').length;
                const totalVotes = sideAcount + sideBcount + neutralCount;

                const voteDistribution = {
                  sideA: totalVotes > 0 ? Math.round((sideAcount / totalVotes) * 100) : 0,
                  sideB: totalVotes > 0 ? Math.round((sideBcount / totalVotes) * 100) : 0,
                  neutral: totalVotes > 0 ? Math.round((neutralCount / totalVotes) * 100) : 0
                };

                const voteCounts = {
                  sideA: sideAcount,
                  sideB: sideBcount,
                  neutral: neutralCount
                };

                return {
                  ...prevClash,
                  Clash_arguments: updatedArguments,
                  votes: updatedVotes,
                  voteDistribution,
                  voteCounts
                };
              });
            }}
          />
        )}
        
        <div id="arguments-section">
          <ArgumentsList 
            arguments={clash.Clash_arguments || []}
            setArguments={(newArgs) => {
              setClash(prev => ({
                ...prev,
                Clash_arguments: newArgs
              }));
            }}
            sideLabels={clash.sideLabels}
            clashId={clash._id}
          />
        </div>
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">You Might Also Like</h2>
          {similarClashesLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : similarClashesError ? (
            <div className="p-4 text-alert">
              <p>Error loading similar clashes: {similarClashesError}</p>
            </div>
          ) : (
            <>
              {console.log("📦 Passing similarClashes to component:", similarClashes)}
              <SimilarClashes clashes={similarClashes} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}