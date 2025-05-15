import React from 'react';

const ClashVotingBar = ({ clash, votes: propVotes, voteDistribution: propVoteDistribution, sideLabels }) => {
  const sideA_label = sideLabels?.sideA?.label || clash?.sideLabels?.sideA?.label || 'Side A';
  const sideB_label = sideLabels?.sideB?.label || clash?.sideLabels?.sideB?.label || 'Side B';
  const neutral_label = sideLabels?.neutral?.label || clash?.sideLabels?.neutral?.label || 'Neutral';

  const voteDistribution = propVoteDistribution || clash?.voteDistribution || {};
  const votes = propVotes || clash?.votes || {};

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

      {/* Main bar */}
      <div className="relative flex h-14 w-full rounded-full overflow-hidden border border-gray-300 shadow-sm">
        {voteData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-center text-[12px] sm:text-sm font-medium px-1"
            style={{
              width: `${item.adjustedPercent || item.percent}%`,
              minWidth: item.percent === 0 ? '64px' : '40px',
              backgroundColor: item.percent === 0
                ? `${item.bgColor}40`
                : item.bgColor,
              color: item.textColor,
              opacity: item.percent === 0 ? 0.25 : 1,
            }}
          >
            <div className="text-center leading-tight">
              <div className="truncate">{item.label}</div>
              <div className="text-xs font-semibold text-gray-800">
                {item.percent}% ({item.count})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClashVotingBar;