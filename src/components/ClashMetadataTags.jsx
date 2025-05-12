import React from "react";
import getStatusLabel from "../utils/statusLabel";

export default function ClashMetadataTags({ statusLabel, expires_at, tags }) {
  // Calculate time left in hours and minutes
  const getTimeMessage = () => {
    const now = new Date();
    const expires = new Date(expires_at);
    const timeDiff = expires - now;

    if (statusLabel === "finished") {
      return "🧨 Time's up to join";
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `🧨 Only ${hours}h ${minutes}m left to join`;
  };

  return (
    <div className="flex flex-wrap gap-2 text-caption text-secondary">
      <span className="bg-accent/80 text-bgwhite rounded-full px-2 py-0.5">
        {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
      </span>
      <span className="bg-muted25 rounded-full px-2 py-0.5">{getTimeMessage()}</span>
      {tags?.slice(0, 3).map((tag, index) => (
        <span key={index} className="bg-muted25 rounded-full px-2 py-0.5">
          #{tag}
        </span>
      ))}
    </div>
  );
}