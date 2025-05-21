import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ArgumentReplyForm({ parentArgumentId, clashId, onReplySubmitted, onCancel }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/arguments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          parentArgumentId,
          side: 'neutral', // Replies are always neutral
          clashId, // Include the clashId in the payload
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      const newReply = await response.json();
      onReplySubmitted(newReply, true);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setText('');
        onCancel();
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-8 mt-2 pl-4">
      {showSuccess && (
        <p className="text-caption text-muted-dark">✓ Reply added</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reply..."
          className="w-full bg-bgwhite rounded-xl text-caption text-secondary border border-muted25 focus:outline-none resize-y max-h-32 px-3 py-2"
          rows={2}
        />
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className={`px-4 py-2 text-sm rounded-lg ${
              !text.trim() || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#6B7280] text-white hover:bg-gray-700'
            }`}
          >
            {loading ? 'Submitting...' : 'Reply'}
          </button>
        </div>
      </form>
    </div>
  );
} 