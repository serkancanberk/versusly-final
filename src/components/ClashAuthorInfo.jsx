

import React from "react";
import { formatDistanceToNow } from "date-fns";

export default function ClashAuthorInfo({ creator, createdAt }) {
  return (
    <div className="flex items-center space-x-3">
      <img
        src={creator?.picture}
        alt={creator?.name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <span className="text-body text-secondary">@{creator?.name}</span>
        <span className="text-caption text-mutedDark">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}