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
      bgColor: '#FB8000', // orange
      textColor: '#FFFFFF', // white
    },
    {
      label: neutral_label,
      percent: voteDistribution.neutral ?? 0,
      count: votes.neutral ?? 0,
      bgColor: '#6B7280', // darker gray
      textColor: '#FFFFFF', // white
    },
    {
      label: sideB_label,
      percent: voteDistribution.sideB ?? 0,
      count: votes.sideB ?? 0,
      bgColor: '#000000', // black
      textColor: '#FFFFFF', // white
    },
  ]);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 mt-8">The Clash-o-Meter</h2>

      {/* Horizontal bar visualization */}
      <div className="w-full h-6 flex overflow-hidden rounded-lg shadow border border-gray-200">
        {voteData.map((item, index) => (
          <div
            key={index}
            style={{
              width: `${item.adjustedPercent}%`,
              backgroundColor: item.percent === 0
                ? `${item.bgColor}40`
                : item.bgColor,
              color: item.textColor,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              opacity: item.percent === 0 ? 0.25 : 1,
            }}
            title={`${item.label}: ${item.percent}% (${item.count} votes)`}
          >
            {item.percent >= 5 ? `${item.percent}%` : ''}
          </div>
        ))}
      </div>

      {/* Detailed legend below the bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm text-center text-gray-700">
        {voteData.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-center gap-2 font-semibold text-sm">
              <span
                className="inline-block w-3 h-3 rounded-sm border border-white"
                style={{ backgroundColor: item.bgColor }}
              ></span>
              <span style={{ color: item.bgColor }}>{item.label}</span>
            </div>
            <div className="text-xs text-gray-500">
              {item.count} votes
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClashVotingBar;