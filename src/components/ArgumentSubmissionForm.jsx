import React, { useState } from 'react';

export default function ArgumentSubmissionForm({ clashId, sideLabels, onArgumentSubmitted }) {
  const [selectedSide, setSelectedSide] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedSide || !text.trim()) return;

    const payload = {
      side: selectedSide,
      text: text.trim(),
    };

    try {
      setLoading(true);
      const response = await fetch(`/api/clashes/${clashId}/arguments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to submit argument');
      }

      const result = await response.json();
      if (onArgumentSubmitted) {
        onArgumentSubmitted({ ...payload, _id: result._id, createdAt: new Date().toISOString() });
      }

      setText('');
      setSelectedSide('');
    } catch (error) {
      console.error('Error submitting argument:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Drop Your Take</h2>
      <div className="flex gap-4 mb-4">
        <button
          className={`flex-1 py-2 px-4 rounded-lg ${
            selectedSide === 'sideA'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
          onClick={() => setSelectedSide('sideA')}
        >
          {sideLabels?.sideA || 'Side A'}
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg ${
            selectedSide === 'neutral'
              ? 'bg-gray-500 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          onClick={() => setSelectedSide('neutral')}
        >
          Neutral
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg ${
            selectedSide === 'sideB'
              ? 'bg-red-500 text-white'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
          onClick={() => setSelectedSide('sideB')}
        >
          {sideLabels?.sideB || 'Side B'}
        </button>
      </div>
      <textarea
        placeholder="Write your argument here..."
        className="w-full h-32 p-3 border rounded-lg mb-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
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