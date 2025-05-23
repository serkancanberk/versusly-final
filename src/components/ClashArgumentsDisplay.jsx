import React from "react";

export default function ClashArgumentsDisplay({ 
  Clash_arguments = [], 
  isLoading = false,
  onHover,
  onClick,
  buttonRef,
  clashId
}) {
  return (
    <button 
      className="flex items-center justify-center gap-1 text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-4 w-full"
      onMouseEnter={onHover}
      onClick={() => {
        if (clashId) {
          window.location.href = `/clash/${clashId}#arguments-section`;
        } else if (onClick) {
          onClick();
        }
      }}
      ref={buttonRef}
    >
      {isLoading ? (
        <>
          <span>🤺</span>
          <span className="animate-pulse">Loading...</span>
        </>
      ) : Clash_arguments.length === 0 ? (
        <>
          <span>🤺</span>
          <span>- No args yet.</span>
        </>
      ) : (
        <>
          <span>🤺</span>
          <span>
            Args ({Clash_arguments.length}) - {Clash_arguments[0]?.text?.slice(0, 15)}...
          </span>
        </>
      )}
    </button>
  );
}