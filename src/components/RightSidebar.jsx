import React from "react";
import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";

const RightSidebar = ({ onTagClick, selectedTag, user, setUser }) => {
  // GoogleLogin handles login internally
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="p-4 pl-6 pr-4 flex flex-col h-full">
      {/* Top Combat Arenas */}
      <div className="mt-16 flex-grow">
        <h2 className="text-subheading text-secondary mb-4">🛡️ Find Tough Clashes</h2>
        {/* Arama kutusu */}
        <div className="relative mb-3 group">
          <input
            type="text"
            placeholder="What battle are you looking for?"
            className="w-full py-2 px-4 text-sm text-secondary bg-muted25 rounded-md"
            readOnly
          />
          <div className="absolute right-2 top-2 text-secondary">
            🔍
          </div>
          <div
            className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-secondary text-white text-caption px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          >
            Search coming soon!
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {/* İlk satır */}
          <button
            onClick={() => onTagClick(selectedTag === "Mind Duel" ? null : "Mind Duel")}
            className={`px-3 py-3 mt-3 rounded-lg text-caption text-secondary hover:shadow-md hover:bg-opacity-75 ${
              selectedTag === "Mind Duel" ? "bg-primary" : "bg-muted25"
            }`}
          >
            Mind Duel
          </button>
          <button
            onClick={() => onTagClick(selectedTag === "Pop Arena" ? null : "Pop Arena")}
            className={`px-3 py-3 mt-3 rounded-lg text-caption text-secondary hover:shadow-md hover:bg-opacity-75 ${
              selectedTag === "Pop Arena" ? "bg-primary" : "bg-muted25"
            }`}
          >
            Pop Arena
          </button>
          <button
            onClick={() => onTagClick(selectedTag === "Fan Battle" ? null : "Fan Battle")}
            className={`px-3 py-3 mt-3 rounded-lg text-caption text-secondary hover:shadow-md hover:bg-opacity-75 ${
              selectedTag === "Fan Battle" ? "bg-primary" : "bg-muted25"
            }`}
          >
            Fan Battle
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {/* İkinci satır */}
          <button
            onClick={() => onTagClick(selectedTag === "Taste War" ? null : "Taste War")}
            className={`px-3 py-3 mt-3 rounded-lg text-caption text-secondary hover:shadow-md hover:bg-opacity-75 ${
              selectedTag === "Taste War" ? "bg-primary" : "bg-muted25"
            }`}
          >
            Taste War
          </button>
          <button
            onClick={() => onTagClick(selectedTag === "Tech Clash" ? null : "Tech Clash")}
            className={`px-3 py-3 mt-3 rounded-lg text-caption text-secondary hover:shadow-md hover:bg-opacity-75 ${
              selectedTag === "Tech Clash" ? "bg-primary" : "bg-muted25"
            }`}
          >
            Tech Clash
          </button>
          <button
            onClick={() => onTagClick(selectedTag === "Old School" ? null : "Old School")}
            className={`px-3 py-3 mt-3 rounded-lg text-caption text-secondary hover:shadow-md hover:bg-opacity-75 ${
              selectedTag === "Old School" ? "bg-primary" : "bg-muted25"
            }`}
          >
            Old School
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Üçüncü satır */}
          <button
            onClick={() => onTagClick(selectedTag === "Hype Showdown" ? null : "Hype Showdown")}
            className={`px-3 py-3 mt-3 rounded-lg text-caption text-secondary hover:shadow-md hover:bg-opacity-75 ${
              selectedTag === "Hype Showdown" ? "bg-primary" : "bg-muted25"
            }`}
          >
            Hype Showdown
          </button>
          <button
            onClick={() => onTagClick(selectedTag === "Wildcard" ? null : "Wildcard")}
            className={`px-3 py-3 mt-3 rounded-lg text-caption text-secondary hover:shadow-md hover:bg-opacity-75 ${
              selectedTag === "Wildcard" ? "bg-primary" : "bg-muted25"
            }`}
          >
            Wildcard
          </button>
        </div>
        {selectedTag && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => onTagClick(null)}
              className="px-3 py-1 rounded-full bg-alert text-bgwhite text-caption shadow-sm hover:opacity-90 transition"
            >
              ✖ Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Join the Clash */}
      <div className="mt-auto pt-4">
        <h2 className="text-subheading text-secondary mb-2">🪂 Join the Clash</h2>
        <p className="text-label text-muted-dark mb-4">
          From hot takes to showdowns — pick a side and make it count.
        </p>
        {user ? (
          <div className="relative md:sticky top-4 bg-white p-4 rounded-lg shadow-lg border border-muted mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={user?.picture || "/default-avatar.png"}
                alt={user?.name || "User Avatar"}
                className="w-10 h-10 rounded-full ring-2 ring-accent object-cover"
              />
              <div>
                <p className="font-semibold text-body">{user.name}</p>
                <p className="text-caption text-mutedDark">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                fetch("http://localhost:8080/api/auth/logout", {
                  method: "POST",
                  credentials: "include"
                }).finally(() => {
                  setUser(null);
                  window.location.href = "/";
                });
              }}
              className="w-full text-center py-2 mt-3 bg-muted25/75 text-mutedDark text-label rounded-md hover:bg-muted25 hover:scale-105 active:scale-95 transition transform"
            >
              💀 Sign Out
            </button>
          </div>
        ) : (
          <div className="mt-4 mb-4 w-full flex justify-center">
            {isClient && (
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const token = credentialResponse.credential;
                  fetch("http://localhost:8080/api/auth/google", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ token }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      setUser(data.user);
                    })
                    .catch(() => {});
                }}
                onError={() => {}}
                size="large"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
