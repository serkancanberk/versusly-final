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
      clashId: clashId
    };

    console.log("Payload to be sent:", payload);

    try {
      setLoading(true);
      const response = await fetch(`/api/arguments`, {
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

      const newArgument = await response.json();
      if (onArgumentSubmitted) {
        onArgumentSubmitted(newArgument);
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
    const isSelected = selectedSide === sideLabels[side].value;
    return `pick-your-side-button flex-1 py-2 px-3 rounded-2xl text-caption border truncate ${
      isSelected
        ? 'border-accent bg-accent text-white'
        : 'border-accent text-secondary border-opacity-25 border-dashed'
    }`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Drop Your Take</h2>
      <h3 className="text-caption font-medium mb-2 text-mutedDark">Pick your side</h3>
      <div className="flex gap-4 mb-4">
        {!sideLabels ? (
          <p className="text-red-500">Side labels not available.</p>
        ) : (
          ['sideA', 'neutral', 'sideB'].map((key) => {
            const { label, value } = sideLabels[key] || {};
            if (!label || !value) return null;

            return (
              <button
                key={key}
                className={getButtonStyles(key)}
                onClick={() => setSelectedSide(value)}
              >
                {label}
              </button>
            );
          })
        )}
      </div>
      <label 
        className={`block text-caption mb-1 transition-opacity duration-300 text-mutedDark ${!selectedSide ? 'text-alert animate-pulse' : ''}`}
      >
        Your Argument
      </label>
      <textarea
        placeholder="Write your argument here..."
        className="w-full bg-bgwhite rounded-3xl text-caption text-secondary border border-muted25 focus:outline-none resize-y max-h-40 px-3 py-2 pr-10"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {voteFeedback && (
        <div className="flex items-center gap-2 bg-muted-25 border border-accent border-opacity-25 rounded-2xl text-caption text-accent text-opacity-75 px-4 py-3 mt-4">
         {voteFeedback}
        </div>
      )}
      <div className="flex justify-end mt-4">
        <button
          className={`px-6 py-4 bg-accent text-bgashwhite text-label rounded-2xl ${
            selectedSide && text.trim() && !loading
              ? 'hover:bg-opacity-90'
              : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!selectedSide || !text.trim() || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Submitting...' : 'Add Your Argument'}
        </button>
      </div>
    </div>
  );
}