import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ReactionPanel({
  clashId,
  user,
  setSelectedReaction: setParentSelectedReaction,
  initialReactions
}) {
  const isLoggedIn = Boolean(user && user._id);
  const menuRef = useRef(null);
  const containerRef = useRef(null);
  const lastFetchedAt = useRef(0);
  const [active, setActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reactions, setReactions] = useState({});
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [total, setTotal] = useState(0);
  const [menuStyle, setMenuStyle] = useState({ left: '50%', transform: 'translateX(-50%)' });

  const reactionTypes = [
    { emoji: "👑", label: "Nailed It", value: "nailed_it" },
    { emoji: "🤝", label: "Fair Point", value: "fair_point" },
    { emoji: "🤷", label: "Can't Decide", value: "neutral" },
    { emoji: "🙄", label: "Really?", value: "really" },
    { emoji: "🗑️", label: "Try Again", value: "try_again" }
  ];

  // Calculate total from reactions
  const calculateTotal = (reactionData) => {
    return reactionTypes.reduce((sum, type) => sum + (reactionData[type.label] || 0), 0);
  };

  // Map backend totals by label
  const mapTotalsToReactions = (totals) => {
    const mapped = {};
    reactionTypes.forEach(type => {
      mapped[type.label] = totals?.[type.label] || 0;
    });
    return mapped;
  };

  // Only use initialReactions on first render
  useEffect(() => {
    let didCancel = false;
    // Initialize from initialReactions if provided
    if (initialReactions && Object.keys(initialReactions).length > 0) {
      const mappedInit = mapTotalsToReactions(initialReactions);
      setReactions(mappedInit);
      setTotal(calculateTotal(mappedInit));
    }
    const fetchReactions = async () => {
      const now = Date.now();
      if (now - lastFetchedAt.current < 30000) return;
      lastFetchedAt.current = now;
      try {
        const response = await fetch(`/api/reactions/${clashId}`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch reactions');
        const data = await response.json();
        const mapped = mapTotalsToReactions(data.totals);
        if (!didCancel) {
          setReactions(mapped);
          setTotal(calculateTotal(mapped));
          if (data.userReaction) {
            const userReaction = reactionTypes.find(r => r.value === data.userReaction);
            setSelectedReaction(userReaction || null);
            setParentSelectedReaction?.(userReaction || null);
          } else {
            setSelectedReaction(null);
            setParentSelectedReaction?.(null);
          }
        }
      } catch (error) {
        if (!didCancel) {
          toast.error('Reaksiyonlar yüklenirken hata oluştu');
        }
      }
    };
    fetchReactions();
    return () => { didCancel = true; };
  }, [clashId, setParentSelectedReaction, initialReactions]);

  // Update menu position when active state changes
  useEffect(() => {
    if (active) {
      updateMenuPosition();
      window.addEventListener('resize', updateMenuPosition);
      return () => window.removeEventListener('resize', updateMenuPosition);
    }
  }, [active, reactions]);

  // Improved menu positioning logic
  const updateMenuPosition = () => {
    if (!containerRef.current || !menuRef.current) return;
    const container = containerRef.current;
    const menu = menuRef.current;
    const containerRect = container.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Default: center menu horizontally relative to container
    let left = containerRect.width / 2 - menuRect.width / 2;
    let transform = '';

    // Calculate absolute left position relative to container
    let absLeft = containerRect.left + left;

    // If menu would overflow left of viewport or card, align to left edge
    if (absLeft < containerRect.left) {
      left = 0;
      transform = '';
    }
    // If menu would overflow right of viewport or card, align to right edge
    else if (absLeft + menuRect.width > containerRect.right) {
      left = containerRect.width - menuRect.width;
      transform = '';
    } else {
      // Centered
      left = '50%';
      transform = 'translateX(-50%)';
    }
    setMenuStyle({ left, transform });
  };

  // Handle reaction selection
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
      // Always map all reaction types robustly
      const mapped = mapTotalsToReactions(data.totals);
      setReactions(mapped);
      setTotal(calculateTotal(mapped));
      const newSelection = data.userReaction
        ? reactionTypes.find(r => r.value === data.userReaction)
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

  // Hover delay logic
  const timeoutId = useRef(null);
  const handleMouseEnter = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    setActive(true);
  };
  const handleMouseLeave = () => {
    timeoutId.current = setTimeout(() => {
      setActive(false);
      timeoutId.current = null;
    }, 250);
  };

  return (
    <div
      ref={containerRef}
      className="relative group w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full">
        <button
          className={`w-full h-full flex items-center justify-center text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-4 ${
            selectedReaction ? "bg-muted25" : ""
          } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
          disabled={isLoading}
        >
          <span className="flex items-center gap-1">
            {selectedReaction ? (
              <>
                <span>{selectedReaction.emoji}</span>
                <span className="text-xs">{selectedReaction.label}</span>
              </>
            ) : (
              <>
                <span>👊</span>
                <span className="text-xs">
                  React ({total})
                </span>
              </>
            )}
          </span>
        </button>
      </div>
      {active && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={menuRef}
          style={menuStyle}
          className="absolute bottom-14 bg-white rounded-xl shadow-xl p-3 z-30 flex gap-4"
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
                  <span className="ml-1 text-body text-xs font-medium">
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