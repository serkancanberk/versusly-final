import React from 'react';
import { extractSideLabelsFromTitle } from '../utils/parseSides';

const ClashVotingBar = ({ clash, votes: propVotes, voteDistribution: propVoteDistribution }) => {
  const { sideA, sideB } = extractSideLabelsFromTitle(clash?.vs_title || '');
  const voteDistribution = propVoteDistribution || clash?.voteDistribution || {};
  const votes = propVotes || clash?.votes || {};

  const voteData = [
    {
      label: sideA,
      percent: voteDistribution.sideA ?? 0,
      count: votes.sideA ?? 0,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      label: 'Neutral',
      percent: voteDistribution.neutral ?? 0,
      count: votes.neutral ?? 0,
      color: 'bg-gray-400',
      textColor: 'text-gray-600',
    },
    {
      label: sideB,
      percent: voteDistribution.sideB ?? 0,
      count: votes.sideB ?? 0,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Vote Distribution</h2>
      <div className="space-y-4">
        {voteData.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{item.label}</span>
              <div className="text-sm">
                <span className={`font-semibold ${item.textColor}`}>{item.percent}%</span>
                <span className="text-gray-600 ml-2">({item.count} votes)</span>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} transition-all duration-300`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClashVotingBar;