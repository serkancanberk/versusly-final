import React, { useState, useRef, useEffect } from "react";

export default function ReactionPanel({
  clashId,
  reactions = [],
  selectedReaction,
  setSelectedReaction
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const checkLoginState = () => {
      try {
        const userData = localStorage.getItem("user");
        const parsedUser = userData ? JSON.parse(userData) : null;
        setIsLoggedIn(Boolean(parsedUser && parsedUser._id));
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginState();

    window.addEventListener("storage", checkLoginState);
    return () => {
      window.removeEventListener("storage", checkLoginState);
    };
  }, []);

  const mockReactions = [
    { emoji: "👑", label: "Nailed It" },
    { emoji: "🤝", label: "Fair Point" },
    { emoji: "🤷", label: "Can't Decide" },
    { emoji: "🙄", label: "Really?" },
    { emoji: "🗑️", label: "Try Again" }
  ];

  const safeReactions = Array.isArray(reactions) && reactions.length > 0 ? reactions : mockReactions;
  const total = reactions && typeof reactions === "object"
    ? Object.values(reactions).reduce((acc, val) => acc + val, 0)
    : 0;

  const handleSelect = (reaction) => {
    if (!isLoggedIn) return;
    setSelectedReaction(prev => prev?.label === reaction.label ? null : reaction);
    setActive(false);
    // Future: sync with backend using clashId
  };

  return (
    <div className="relative" onMouseLeave={() => setActive(false)}>
      <button
        className={`w-full flex items-center justify-center gap-1 text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-4 ${
          selectedReaction ? "bg-muted25" : ""
        }`}
        onMouseEnter={() => setActive(true)}
      >
        <span>{selectedReaction ? selectedReaction.emoji : "👊"}</span>
        <span>{selectedReaction ? selectedReaction.label : `React (${total})`}</span>
      </button>

      {active && (
        <div
          ref={menuRef}
          className="absolute bottom-14 left-0 bg-white rounded-xl shadow-xl p-3 z-30 grid grid-cols-5 gap-2 animate-fadeIn"
        >
          {safeReactions.map((reaction, index) => (
            <button
              key={index}
              className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                selectedReaction?.label === reaction.label ? "bg-muted25" : "hover:bg-muted25"
              } ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleSelect(reaction)}
              disabled={!isLoggedIn}
            >
              <span className="text-2xl">{reaction.emoji}</span>
              <span className="text-xs text-center mt-1">{reaction.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}