

import React from 'react';

export default function ArgumentsList({ arguments: args }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Arguments</h2>
      {args?.length > 0 ? (
        <div className="space-y-4">
          {args.map((arg) => (
            <div key={arg._id} className="bg-white dark:bg-secondary p-4 rounded-lg shadow border border-muted">
              <p className="text-gray-800 dark:text-muted">{arg.text}</p>
              <div className="mt-2 text-sm text-gray-500 dark:text-muted-dark">
                <span>
                  {arg.side === 'sideA'
                    ? 'For'
                    : arg.side === 'sideB'
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
        <p className="text-gray-500 dark:text-muted-dark">
          No arguments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}