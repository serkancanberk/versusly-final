import React, { useState, useEffect } from 'react';
import { FaUser, FaThumbsUp, FaComment, FaTag } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ClashAuthorInfo from './ClashAuthorInfo';
import ReactionPanel from './ReactionPanel';
import ClashArgumentsDisplay from './ClashArgumentsDisplay';
import ClashShare from './ClashShare';
import ClashDropdownMenu from './ClashDropdownMenu';
import ClashContentPreview from './ClashContentPreview';
import getStatusLabel from '../utils/statusLabel';
import { extractSideLabelsFromTitle } from '../utils/parseSides';
import ClashVotingBar from './ClashVotingBar';
import ArgumentSubmissionForm from './ArgumentSubmissionForm';

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
      <ClashArgumentsDisplay count={argumentCount} />
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

const ArgumentsList = ({ arguments: args }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4">Arguments</h2>
    {args?.length > 0 ? (
      <div className="space-y-4">
        {args.map((arg) => (
          <div key={arg._id} className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-800">{arg.text}</p>
            <div className="mt-2 text-sm text-gray-500">
              <span>
                {arg.side === 'for'
                  ? 'For'
                  : arg.side === 'against'
                  ? 'Against'
                  : 'Neutral'}
              </span>
              <span className="mx-2">•</span>
              <span>{new Date(arg.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">No arguments yet. Be the first to share your thoughts!</p>
    )}
  </div>
);

const SimilarClashes = ({ clashes }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4">Similar Clashes</h2>
    <div className="space-y-4">
      {(clashes || Array(3).fill(null)).map((clash, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
        >
          <h3 className="font-semibold mb-1">{clash?.title || `Similar Clash ${index + 1}`}</h3>
          <p className="text-sm text-gray-600 mb-2">{clash?.statement || 'This is a sample clash statement...'}</p>
          <p className="text-sm text-gray-500">{clash?.preview || 'Preview of the clash content...'}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function ClashDetails({ clashId }) {
  const [clash, setClash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchClash = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/clashes/${clashId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const argumentCount = Array.isArray(data.Clash_arguments) ? data.Clash_arguments.length : 0;
      data.statusLabel = getStatusLabel({
        createdAt: data.createdAt,
        expires_at: data.expires_at,
        argumentCount,
        reactions: data.reactions
      });
      setClash(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch clash details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clashId) {
      setLoading(false);
      return;
    }

    fetchClash();

    return () => {
      setClash(null);
      setError(null);
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
                const updatedArguments = [...(prevClash.Clash_arguments || []), newArgument];

                const updatedVotes = newArgument.voteRecorded
                  ? [...(prevClash.votes || []), {
                      userId: user._id,
                      side: newArgument.side,
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
        
        <ArgumentsList arguments={clash.Clash_arguments} />
        <SimilarClashes clashes={clash.similarClashes} />
      </div>
    </div>
  );
}