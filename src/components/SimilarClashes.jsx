import React from 'react';
import { Link } from 'react-router-dom';

export default function SimilarClashes({ clashes }) {
  if (!clashes || clashes.length === 0) {
    return (
      <div className="text-muted text-sm px-4 py-2">
        No similar clashes found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clashes.map((clash, index) => (
        <Link
          to={`/clash/${clash._id}`}
          key={clash._id || index}
          className="flex flex-col md:flex-row gap-4 border rounded-lg p-4 hover:bg-gray-50 transition"
        >
          {/* Görsel */}
          {clash.image && (
            <img
              src={clash.image}
              alt="clash visual"
              className="w-full md:w-32 h-32 object-cover rounded-md"
            />
          )}

          {/* Metin ve bilgiler */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base md:text-lg">
                {clash.vs_title || `Similar Clash ${index + 1}`}
              </h3>

              {/* Statü etiketi */}
              {clash.reactionsCount > 50 && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full ml-2">
                  🔥 Hot
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {clash.vs_statement || 'This is a sample clash statement...'}
            </p>

            {/* Etiketler */}
            <div className="flex flex-wrap gap-1 mt-2">
              {clash.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Creator ve CTA */}
            <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
              {clash.creator && (
                <div className="flex items-center gap-2">
                  <img
                    src={clash.creator.picture || '/avatar.png'}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{clash.creator.name}</span>
                </div>
              )}

              <button className="text-accent underline text-xs">View Clash →</button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}