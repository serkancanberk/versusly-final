import React, { useState } from 'react';

export default function ArgumentSubmissionForm({ clashId, sideLabels, onArgumentSubmitted }) {
  console.log("Received sideLabels:", sideLabels);
  const [selectedSide, setSelectedSide] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [voteFeedback, setVoteFeedback] = useState(null);

  const handleSubmit = async () => {
    if (!selectedSide || !text.trim()) return;

    // Map the side values to what the backend expects
    const sideMap = {
      'for': 'for',
      'against': 'against',
      'neutral': 'neutral'
    };

    const payload = {
      side: sideMap[selectedSide],
      text: text.trim(),
    };

    console.log("Payload to be sent:", payload);

    try {
      setLoading(true);
      const response = await fetch(`/api/clashes/${clashId}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit argument');
      }

      const result = await response.json();
      if (onArgumentSubmitted) {
        onArgumentSubmitted({
          ...payload,
          _id: result._id,
          createdAt: new Date().toISOString(),
          voteRecorded: result.voteRecorded,
          side: payload.side
        });
      }

      if (result.voteRecorded) {
        setVoteFeedback('Your vote has been recorded!');
        setTimeout(() => setVoteFeedback(null), 5000);
      }

      setText('');
      setSelectedSide('');
      setVoteFeedback('✅ Your argument has been submitted successfully!');
      setTimeout(() => setVoteFeedback(null), 5000);
    } catch (error) {
      console.error('Error submitting argument:', error);
      setVoteFeedback(error.message || 'Failed to submit argument');
      setTimeout(() => setVoteFeedback(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyles = (side) => {
    const baseStyles = 'flex-1 py-2 px-4 rounded-lg';
    const isSelected = selectedSide === sideLabels[side].value;
    
    switch (side) {
      case 'sideA':
        return `${baseStyles} ${
          isSelected
            ? 'bg-blue-500 text-white'
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        }`;
      case 'sideB':
        return `${baseStyles} ${
          isSelected
            ? 'bg-red-500 text-white'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`;
      case 'neutral':
        return `${baseStyles} ${
          isSelected
            ? 'bg-gray-500 text-white'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Drop Your Take</h2>
      <div className="flex gap-4 mb-4">
        {!sideLabels ? (
          <p className="text-red-500">Side labels not available.</p>
        ) : (
          Object.entries(sideLabels).map(([key, { label, value }]) => (
            <button
              key={key}
              className={getButtonStyles(key)}
              onClick={() => setSelectedSide(value)}
            >
              {label}
            </button>
          ))
        )}
      </div>
      <textarea
        placeholder="Write your argument here..."
        className="w-full h-32 p-3 border rounded-lg mb-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {voteFeedback && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
          {voteFeedback}
        </div>
      )}
      <button
        className={`w-full text-white py-2 rounded-lg transition ${
          selectedSide && text.trim()
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
        disabled={!selectedSide || !text.trim() || loading}
        onClick={handleSubmit}
      >
        {loading ? 'Submitting...' : 'Add Argument'}
      </button>
    </div>
  );
}