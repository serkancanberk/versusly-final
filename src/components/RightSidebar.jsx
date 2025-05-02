import React from "react";
import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";

const RightSidebar = ({ onTagClick, selectedTag }) => {
  // GoogleLogin handles login internally

  const [profile, setProfile] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8080/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then(data => setProfile(data.user || data))
        .catch(() => setProfile(null));
    }
  }, []);

  return (
    <div className="p-4 pl-6 pr-4 flex flex-col h-full">
      {/* Top Combat Arenas */}
      <div className="mt-16 flex-grow">
        <h2 className="text-subheading text-secondary mb-4">🛡️ Find Tough Clashes</h2>
        {/* Arama kutusu */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="What battle are you looking for?"
            className="w-full py-2 px-4 text-sm text-secondary bg-muted25 rounded-md"
          />
          <div className="absolute right-2 top-2 text-secondary">
            🔍
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
        {profile ? (
          <div className="flex items-center space-x-3 mb-4">
            <img src={profile.picture} alt={profile.name} className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-semibold text-body">{profile.name}</p>
              <p className="text-caption text-muted">{profile.email}</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 mb-2">
            {isClient && (
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const token = credentialResponse.credential;
                  fetch("http://localhost:8080/api/auth/google", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      console.log("Backend response:", data);
                      localStorage.setItem("token", data.token);
                      setProfile(data.user);
                    })
                    .catch((err) => {
                      console.error("Error sending token to backend:", err);
                    });
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
                size="large"
              />
            )}
          </div>
        )}
        <button className="w-full px-3 py-3 mt-2 mb-2 bg-muted25 text-label text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">
          Rejoin
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
