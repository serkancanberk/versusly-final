import React from "react";
import ClashMetadataTags from "./ClashMetadataTags";

export default function ClashContentPreview({ icon = "⚔️", title, statement, statusLabel, expires_at, tags }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-label text-secondary">
        <span className="w-8 h-8 rounded-full bg-muted25 flex items-center justify-center text-body">
          {icon}
        </span>
        <span className="text-body font-bold">{title}</span>
      </div>
      <ClashMetadataTags statusLabel={statusLabel} expires_at={expires_at} tags={tags} />
      <h2 className="text-subheading text-secondary mt-1">{statement}</h2>
    </div>
  );
}