import React, { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "../context/AuthContext";

export default function ArgumentsList({ arguments: args = [], setArguments, sideLabels }) {
  const { user: currentUser } = useAuth();
  const [openMenuId, setOpenMenuId] = React.useState(null);
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const handleReportArgument = (argId) => {
    alert(`Report functionality is not implemented yet for argument ${argId}`);
  };

  useEffect(() => {
    console.log("🔥 ArgumentsList mounted with props:", args);
    console.log("🔍 sideLabels received:", sideLabels);
  }, [args, sideLabels]);
  console.log("🧪 args length:", args?.length, "first arg:", args?.[0]);

  // Close argument menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".argument-menu")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteArgument = async (argId) => {
    try {
      const res = await fetch(`/api/arguments/${argId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        const updated = args.filter((arg) => arg._id !== argId);
        setArguments(updated);
        // The parent component will handle updating clash.Clash_arguments
        // through the setArguments callback
      } else {
        console.error("Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting argument:", err);
    }
  };

  const getSideLabel = (side) => {
    console.log("🎯 Processing side:", side);
    
    // If side is null/undefined, return Unknown
    if (!side) return "Unknown";
    
    // If side is an object with a label, use it directly
    if (typeof side === "object" && side.label) {
      return side.label;
    }
    
    // Get the value to check against sideLabels
    const sideValue = typeof side === "object" ? side.value : side;
    
    // Map the value to the appropriate label from sideLabels
    if (sideValue === "for") return sideLabels?.sideA?.label || "For";
    if (sideValue === "against") return sideLabels?.sideB?.label || "Against";
    if (sideValue === "neutral") return sideLabels?.neutral?.label || "Neutral";
    
    // Fallback
    return "Unknown";
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Arguments</h2>
      {args?.length > 0 ? (
        <div className="space-y-4">
          {args.map((arg) => {
            // Log the user object before rendering the img
            console.log("👤 Argument user object:", arg.user);
            return (
            <div 
              key={arg._id} 
              className="bg-white dark:bg-secondary p-4 rounded-lg shadow border border-muted/50 hover:shadow-md hover:border-muted transition-all duration-200 relative"
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
                </div>
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-muted-dark">
          No arguments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}