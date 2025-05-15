import React from 'react';

const ClashVotingBar = ({ clash, votes: propVotes, voteDistribution: propVoteDistribution, sideLabels }) => {
  const sideA_label = sideLabels?.sideA?.label || clash?.sideLabels?.sideA?.label || 'Side A';
  const sideB_label = sideLabels?.sideB?.label || clash?.sideLabels?.sideB?.label || 'Side B';
  const neutral_label = sideLabels?.neutral?.label || clash?.sideLabels?.neutral?.label || 'Neutral';

  const isTestMode = false; // toggle this to false to disable mock data
  const mockVoteDistribution = { sideA: 32, neutral: 10, sideB: 58 };
  const mockVotes = { sideA: 8, neutral: 3, sideB: 14 };

  const voteDistribution = isTestMode ? mockVoteDistribution : (propVoteDistribution || clash?.voteDistribution || {});
  const votes = isTestMode ? mockVotes : (propVotes || clash?.votes || {});

  // Calculate minimum width (2% of total width)
  const MIN_SEGMENT_WIDTH = 2;
  
  // Adjust percentages to ensure minimum width while maintaining proportions
  const adjustPercentages = (data) => {
    const totalNonZero = data.reduce((sum, item) => sum + (item.percent > 0 ? item.percent : 0), 0);
    const zeroCount = data.filter(item => item.percent === 0).length;
    
    if (zeroCount === 0) return data; // No adjustment needed if all segments have votes
    
    const minWidthTotal = zeroCount * MIN_SEGMENT_WIDTH;
    const remainingWidth = 100 - minWidthTotal;
    
    return data.map(item => ({
      ...item,
      adjustedPercent: item.percent === 0 
        ? MIN_SEGMENT_WIDTH 
        : (item.percent / totalNonZero) * remainingWidth
    }));
  };

  const voteData = adjustPercentages([
    {
      label: sideA_label,
      percent: voteDistribution.sideA ?? 0,
      count: votes.sideA ?? 0,
      bgColor: '#FB8000',
      textColor: '#FCFCFC',
    },
    {
      label: neutral_label,
      percent: voteDistribution.neutral ?? 0,
      count: votes.neutral ?? 0,
      bgColor: '#9CA3AF', // Tailwind gray-400 hex
      textColor: '#4B5563', // Tailwind gray-600 hex
    },
    {
      label: sideB_label,
      percent: voteDistribution.sideB ?? 0,
      count: votes.sideB ?? 0,
      bgColor: '#EF4444', // Tailwind red-500 hex
      textColor: '#DC2626', // Tailwind red-600 hex
    },
  ]);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 mt-8">Vote Distribution</h2>

      {/* Three-column card layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {voteData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center rounded-lg shadow-sm border border-gray-200 p-4 min-h-[120px]"
            style={{
              backgroundColor: item.percent === 0
                ? `${item.bgColor}40`
                : item.bgColor,
              color: item.textColor,
              opacity: item.percent === 0 ? 0.25 : 1,
            }}
          >
            <div className="text-center">
              <div className="text-base font-medium mb-2 truncate max-w-full">
                {item.label}
              </div>
              <div className="text-sm font-semibold">
                {item.percent}%
              </div>
              <div className="text-xs text-gray-800">
                ({item.count} votes)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClashVotingBar;