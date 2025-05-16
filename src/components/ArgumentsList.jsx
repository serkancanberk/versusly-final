import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "../context/AuthContext";
import ArgumentReplyForm from './ArgumentReplyForm';

export default function ArgumentsList({ arguments: args = [], setArguments, sideLabels, clashId }) {
  const { user: currentUser } = useAuth();
  const [openMenuId, setOpenMenuId] = React.useState(null);
  const [replyingToId, setReplyingToId] = React.useState(null);
  const [groupedArguments, setGroupedArguments] = useState({});

  // Group arguments by parent
  useEffect(() => {
    if (!Array.isArray(args)) return;
    console.log("📦 args updated:", args);

    const grouped = {};

    // First pass: add only top-level arguments as keys
    args.forEach(arg => {
      if (!arg.parentArgumentId) {
        grouped[arg._id] = { ...arg, replies: [] };
      }
    });

    // Second pass: assign replies to parents
    args.forEach(arg => {
      if (arg.parentArgumentId && grouped[arg.parentArgumentId]) {
        grouped[arg.parentArgumentId].replies.push(arg);
      }
    });

    setGroupedArguments(grouped);
  }, [args]);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleReportArgument = (argId) => {
    alert(`Report functionality is not implemented yet for argument ${argId}`);
  };

  const handleReply = (argId) => {
    setReplyingToId(argId);
  };

  const handleReplySubmitted = (newReply) => {
    setArguments(prevArgs => {
      if (prevArgs.some(arg => arg._id === newReply._id)) return prevArgs;
      return [...prevArgs, newReply];
    });

    setGroupedArguments(prevGrouped => {
      const parentId = newReply.parentArgumentId;
      const parent = prevGrouped[parentId];
      if (parent) {
        return {
          ...prevGrouped,
          [parentId]: {
            ...parent,
            replies: [...(parent.replies || []), newReply]
          }
        };
      }
      return prevGrouped;
    });

    setReplyingToId(null);
  };

  const handleDeleteArgument = async (argId) => {
    try {
      const res = await fetch(`/api/arguments/${argId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        const updated = args.filter((arg) => arg._id !== argId);
        setArguments(updated);
      } else {
        console.error("Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting argument:", err);
    }
  };

  const getSideLabel = (side) => {
    if (!side) return "Unknown";
    
    if (typeof side === "object" && side.label) {
      return side.label;
    }
    
    const sideValue = typeof side === "object" ? side.value : side;
    
    if (sideValue === "for") return sideLabels?.sideA?.label || "For";
    if (sideValue === "against") return sideLabels?.sideB?.label || "Against";
    if (sideValue === "neutral") return sideLabels?.neutral?.label || "Neutral";
    
    return "Unknown";
  };

  const renderArgument = (arg, isReply = false) => (
    <div 
      key={arg._id} 
      className={`bg-white dark:bg-secondary p-4 rounded-lg shadow border border-muted/50 hover:shadow-md hover:border-muted transition-all duration-200 relative ${
        isReply ? 'ml-8 mt-2 border-l-2 border-gray-200' : ''
      }`}
    >
      <div className="absolute top-2 right-2">
        <button className="text-muted dark:text-muted-dark hover:text-secondary" onClick={() => toggleMenu(arg._id)}>
          ⋮
        </button>
        {openMenuId === arg._id && (
          <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-secondary border border-gray-200 dark:border-muted rounded shadow z-10 argument-menu">
            {arg.user?._id === currentUser?._id ? (
              <button
                onClick={() => handleDeleteArgument(arg._id)}
                className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-muted"
              >
                Delete
              </button>
            ) : (
              <button
                onClick={() => handleReportArgument(arg._id)}
                className="block w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-gray-100 dark:hover:bg-muted"
              >
                Report
              </button>
            )}
          </div>
        )}
      </div>
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
              className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-normal ${
                (typeof arg.side === 'string' ? arg.side : arg.side?.value) === 'for'
                  ? 'bg-[#FB8000] text-white'
                  : (typeof arg.side === 'string' ? arg.side : arg.side?.value) === 'against'
                  ? 'bg-black text-white'
                  : 'bg-[#6B7280] text-white'
              }`}
            >
              {getSideLabel(arg.side)}
            </span>
          </div>
          <p className="text-sm text-gray-800 dark:text-muted mt-1">{arg.text}</p>
          {!isReply && currentUser && (
            <button
              onClick={() => handleReply(arg._id)}
              className="mt-2 text-sm text-primary hover:text-primary-dark"
            >
              Reply
            </button>
          )}
        </div>
      </div>
      {replyingToId === arg._id && (
        <ArgumentReplyForm
          parentArgumentId={arg._id}
          clashId={clashId}
          onReplySubmitted={handleReplySubmitted}
          onCancel={() => setReplyingToId(null)}
        />
      )}
      {!isReply && groupedArguments[arg._id]?.replies?.map(reply => renderArgument(reply, true))}
    </div>
  );

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Arguments</h2>
      {args?.length > 0 ? (
        <div className="space-y-4">
          {Object.values(groupedArguments)
            .filter(arg => !arg.parentArgumentId)
            .map(arg => renderArgument(arg))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-muted-dark">
          No arguments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}