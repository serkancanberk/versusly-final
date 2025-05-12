import React from "react";

export default function ClashDropdownMenu({
  isLoggedIn,
  onReport,
  dropdownRef,
  showDropdown,
  toggleDropdown
}) {
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="text-secondary hover:text-mutedDark transition-colors px-2 py-1"
      >
        ⋮
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          {isLoggedIn ? (
            <button 
              onClick={onReport}
              className="block w-full text-left px-4 py-2 text-sm text-alert hover:bg-muted25"
            >
              ⚠️ Report Clash
            </button>
          ) : (
            <div className="px-4 py-2 text-sm text-mutedDark italic">
              Login required
            </div>
          )}
        </div>
      )}
    </div>
  );
}