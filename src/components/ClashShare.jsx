import React, { useState } from "react";

export default function ClashShare({ clashId }) {
  const [copied, setCopied] = useState(false);
  const clashLink = `${window.location.origin}/clash/${clashId}`;

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(clashLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="w-full flex items-center justify-center gap-1 text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-4"
      title="Copy link"
    >
      <span>🔗</span>
      <span>{copied ? "Link Copied!" : "Copy Link"}</span>
    </button>
  );
}
