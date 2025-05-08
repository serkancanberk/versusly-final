import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ReactionPanel({
  clashId,
  user,
  setSelectedReaction: setParentSelectedReaction
}) {
  const isLoggedIn = Boolean(user && user._id);
  const menuRef = useRef(null);
  const [active, setActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reactions, setReactions] = useState({});
  const [selectedReaction, setSelectedReaction] = useState(null);

  const reactionTypes = [
    { emoji: "👑", label: "Nailed It", value: "nailed_it" },
    { emoji: "🤝", label: "Fair Point", value: "fair_point" },
    { emoji: "🤷", label: "Can't Decide", value: "neutral" },
    { emoji: "🙄", label: "Really?", value: "really" },
    { emoji: "🗑️", label: "Try Again", value: "try_again" }
  ];

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/reactions/${clashId}`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch reactions');
        
        const data = await response.json();
        console.log('Fetched reaction data:', data);
        setReactions(data.totals || {});
        if (data.userReaction) {
          setSelectedReaction(data.userReaction);
          setParentSelectedReaction?.(data.userReaction);
        }
      } catch (error) {
        console.error('Error fetching reactions:', error);
        toast.error('Failed to load reactions');
      }
    };

    fetchReactions();
  }, [clashId, setParentSelectedReaction]);

  const handleSelect = async (reaction) => {
    if (!isLoggedIn || isLoading) return;

    try {
      setIsLoading(true);
      const isRemoving = selectedReaction?.label === reaction.label;
      
      const response = await fetch('/api/reactions', {
        method: isRemoving ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          clashId,
          reaction: isRemoving ? null : reaction.value
        })
      });

      if (!response.ok) throw new Error('Failed to update reaction');

      const data = await response.json();
      console.log('Updated reaction response:', data);
      
      setReactions(data.totals || {});
      const newSelection = data.userReaction
        ? reactionTypes.find(r => r.label === data.userReaction)
        : null;
      setSelectedReaction(newSelection);
      setParentSelectedReaction?.(newSelection);
      setActive(false);
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    } finally {
      setIsLoading(false);
    }
  };

  const total = Object.values(reactions).reduce((acc, val) => acc + val, 0);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <button
        className={`w-full flex items-center justify-center gap-1 text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-4 ${
          selectedReaction ? "bg-muted25" : ""
        } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
        disabled={isLoading}
      >
        <span className="ml-1 flex items-center gap-1">
          {selectedReaction ? (
            <>
              <span>{selectedReaction.emoji}</span>
              <span className="text-xs">{selectedReaction.label}</span>
            </>
          ) : (
            <>
              <span>👊</span>
              <span className="text-xs">React ({total})</span>
            </>
          )}
        </span>
      </button>

      {active && (
        <div
          ref={menuRef}
          className="absolute bottom-14 left-0 bg-white rounded-xl shadow-xl p-3 z-30 hidden gap-4 group-hover:flex"
        >
          {reactionTypes.map((reaction, index) => (
            <button
              key={index}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-md transition-colors ${
                selectedReaction?.label === reaction.label ? "bg-muted25" : "hover:bg-muted25"
              } ${(!isLoggedIn || isLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleSelect(reaction)}
              disabled={!isLoggedIn || isLoading}
            >
              <div className="flex flex-col items-center">
                <span className="text-xl">{reaction.emoji}</span>
                <span className="text-xs whitespace-nowrap">
                  {reaction.label}
                  <span className="ml-1 text-muted text-xs font-medium">
                    ({reactions[reaction.label] || 0})
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}