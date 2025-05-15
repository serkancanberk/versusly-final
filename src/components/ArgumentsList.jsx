import React, { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function ArgumentsList({ arguments: args }) {
  useEffect(() => {
    console.log("🔥 ArgumentsList mounted with props:", args);
  }, [args]);
  console.log("🧪 args length:", args?.length, "first arg:", args?.[0]);
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Arguments</h2>
      {args?.length > 0 ? (
        <div className="space-y-4">
          {[...args].reverse().map((arg) => (
            <div 
              key={arg._id} 
              className="bg-white dark:bg-secondary p-4 rounded-lg shadow border border-muted/50 hover:shadow-md hover:border-muted transition-all duration-200"
            >
              <div className="flex items-start mb-2 space-x-3">
                <img
                  src={(arg.user?.picture) || "/default-avatar.png"}
                  alt={(arg.user?.name) || "Anonymous"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-secondary dark:text-white">
                      {arg.user?.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted dark:text-muted-dark">
                      {formatDistanceToNow(new Date(arg.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-muted-dark">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        arg.side === 'for'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : arg.side === 'against'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                      }`}
                    >
                      {arg.side === 'for'
                        ? 'For'
                        : arg.side === 'against'
                        ? 'Against'
                        : 'Neutral'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-muted mt-1">{arg.text}</p>
                </div>
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