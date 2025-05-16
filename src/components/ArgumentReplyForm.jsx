import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ArgumentReplyForm({ parentArgumentId, clashId, onReplySubmitted, onCancel }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      onReplySubmitted(newReply);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-8 mt-2 border-l-2 border-gray-200 pl-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reply..."
          className="w-full bg-bgwhite rounded-3xl text-caption text-secondary border border-muted25 focus:outline-none resize-y max-h-32 px-3 py-2"
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
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {loading ? 'Submitting...' : 'Reply'}
          </button>
        </div>
      </form>
    </div>
  );
} 