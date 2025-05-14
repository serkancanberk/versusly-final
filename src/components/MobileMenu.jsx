// src/components/MobileMenu.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function MobileMenu({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [topTags, setTopTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch top tags
  useEffect(() => {
    const fetchTopTags = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/clashes/top-tags");
        const data = await response.json();
        // Ensure we have valid data and sort by count
        const filtered = Array.isArray(data) 
          ? data
              .filter(tag => tag && typeof tag === 'object' && tag.tag && typeof tag.count === 'number')
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
          : [];
        setTopTags(filtered);
      } catch (error) {
        console.error("Error fetching top tags:", error);
        setTopTags([]); // Ensure fallback to empty array on error
      } finally {
        setIsLoadingTags(false);
      }
    };

    if (isOpen) {
      fetchTopTags();
    }
  }, [isOpen]);

  // Handle tag click
  const handleTagClick = (tag) => {
    onClose();
    setTimeout(() => {
      navigate(`/tag/${encodeURIComponent(tag)}`);
    }, 300); // match transition duration
  };

  // Handle search
  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/');
    }
    onClose();
  };

  // Handle animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match transition duration
      document.body.style.overflow = 'auto';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/");
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header with Logo and Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-muted dark:border-gray-700">
        <Link to="/" onClick={onClose} className="flex items-center">
          <span className="text-subheading text-secondary dark:text-gray-300">⚔️</span>
          <h1 className="text-subheading font-bold text-secondary dark:text-gray-300 ml-2">Versusly.co</h1>
        </Link>
        <button
          onClick={onClose}
          className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert p-2 rounded-lg hover:bg-muted25 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label="Close menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Auth Section */}
      <div className="p-4 border-b border-muted dark:border-gray-700">
        {user ? (
          <div className="flex items-center space-x-3">
            <img
              src={user.picture || "/default-avatar.png"}
              alt={user.name || "User Avatar"}
              className="w-12 h-12 rounded-full ring-2 ring-accent object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-body text-secondary dark:text-gray-300">{user.name}</p>
              <p className="text-caption text-mutedDark dark:text-gray-400">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-caption text-mutedDark dark:text-gray-400 hover:text-alert dark:hover:text-alert transition-colors"
              aria-label="Sign out"
            >
              💀
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <p className="text-body text-secondary dark:text-gray-300 text-center">
              Join the clash and make your voice heard!
            </p>
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
                      onClose();
                    })
                    .catch(() => {});
                }}
                onError={() => {}}
                size="large"
                width="100%"
                text="signin_with"
                shape="rectangular"
                theme="filled_blue"
              />
            )}
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-muted dark:border-muted rounded-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="Search clashes..."
            className="w-full px-4 py-3 text-secondary dark:text-gray-300 placeholder:text-secondary/50 dark:placeholder:text-gray-400 bg-muted25 dark:bg-gray-800 border-2 border-muted dark:border-muted rounded-2xl pr-12 focus:outline-none focus:ring-2 focus:ring-muted dark:focus:ring-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onDoubleClick={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(searchQuery);
              }
            }}
          />
          {searchQuery.trim() !== "" ? (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert"
              onClick={() => {
                setSearchQuery("");
                handleSearch("");
              }}
              aria-label="Clear search"
            >
              ❌
            </button>
          ) : (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert"
              onClick={() => handleSearch(searchQuery)}
              aria-label="Trigger search"
            >
              🔍
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-auto">
        <ul className="divide-y divide-muted dark:divide-gray-700">
          <li>
            <Link to="/" onClick={onClose} className="flex items-center p-4 text-secondary dark:text-gray-300 hover:bg-muted25 dark:hover:bg-gray-800 transition-colors duration-200">
              <span className="inline-block w-8 mr-3 text-center">💣</span>
              <span className="text-body">Feed</span>
            </Link>
          </li>
          <li>
            <Link to="/profile" onClick={onClose} className="flex items-center p-4 text-secondary dark:text-gray-300 hover:bg-muted25 dark:hover:bg-gray-800 transition-colors duration-200">
              <span className="inline-block w-8 mr-3 text-center">🥷🏻</span>
              <span className="text-body">Profile</span>
            </Link>
          </li>
          <li>
            <Link to="/notifications" onClick={onClose} className="flex items-center p-4 text-secondary dark:text-gray-300 hover:bg-muted25 dark:hover:bg-gray-800 transition-colors duration-200">
              <span className="inline-block w-8 mr-3 text-center">🚩</span>
              <span className="text-body">Notifications</span>
            </Link>
          </li>
          <li>
            <Link to="/stats" onClick={onClose} className="flex items-center p-4 text-secondary dark:text-gray-300 hover:bg-muted25 dark:hover:bg-gray-800 transition-colors duration-200">
              <span className="inline-block w-8 mr-3 text-center">☠️</span>
              <span className="text-body">Stats</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" onClick={onClose} className="flex items-center p-4 text-secondary dark:text-gray-300 hover:bg-muted25 dark:hover:bg-gray-800 transition-colors duration-200">
              <span className="inline-block w-8 mr-3 text-center">⚙️</span>
              <span className="text-body">Settings</span>
            </Link>
          </li>
          <li>
            <Link to="/help" onClick={onClose} className="flex items-center p-4 text-secondary dark:text-gray-300 hover:bg-muted25 dark:hover:bg-gray-800 transition-colors duration-200">
              <span className="inline-block w-8 mr-3 text-center">🆘</span>
              <span className="text-body">Help</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Tag Filter Section */}
      <div className="p-4">
        <h2 className="text-subheading text-secondary dark:text-gray-300 mb-4">🛡️ Find Tough Clashes</h2>
        <div className="flex flex-wrap gap-2">
          {isLoadingTags ? (
            <div className="w-full text-center text-mutedDark dark:text-gray-400">Loading tags...</div>
          ) : topTags.length === 0 ? (
            <div className="w-full text-center text-mutedDark dark:text-gray-400">No tags available</div>
          ) : (
            topTags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-caption bg-muted25 dark:bg-gray-800 text-secondary dark:text-gray-300 hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors"
                title={`${count} clashes`}
              >
                #{tag}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Start A New Clash Button */}
      <div className="p-4 bg-white dark:bg-gray-900">
        <button
          onClick={() => {
            onClose();
            setTimeout(() => {
              const event = new CustomEvent("openClashForm", { detail: { view: "detailed" } });
              window.dispatchEvent(event);
            }, 300); // match transition duration
          }}
          className="w-full bg-accent hover:bg-alert/90 text-white font-bold py-3 px-4 rounded-3xl transition-colors duration-200 text-center"
        >
          ⚔️ Start A New Clash
        </button>
      </div>

      {/* Social Media Icons */}
      <div className="border-t border-muted dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <div className="flex justify-center space-x-6">
          <a href="#" className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M16.375 3.25a4.388 4.388 0 0 1 4.375 4.375v8.75a4.388 4.388 0 0 1-4.375 4.375h-8.75a4.389 4.389 0 0 1-4.375-4.375v-8.75A4.388 4.388 0 0 1 7.625 3.25h8.75zm0-1.75h-8.75C4.256 1.5 1.5 4.256 1.5 7.625v8.75c0 3.369 2.756 6.125 6.125 6.125h8.75c3.369 0 6.125-2.756 6.125-6.125v-8.75c0-3.369-2.756-6.125-6.125-6.125z"/>
              <path d="M17.688 7.625a1.313 1.313 0 1 1 0-2.625 1.313 1.313 0 0 1 0 2.625z"/>
              <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0-1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5z"/>
            </svg>
          </a>
          <a href="#" className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M21.593 7.203a2.506 2.506 0 0 0-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 0 0-1.766 1.778C2 8.83 2 12 2 12s0 3.17.403 4.797a2.506 2.506 0 0 0 1.767 1.763c1.566.433 7.83.44 7.83.44s6.265.007 7.831-.403a2.506 2.506 0 0 0 1.767-1.763C22 15.17 22 12 22 12s0-3.17-.407-4.797zM10 15V9l5.2 3-5.2 3z"/>
            </svg>
          </a>
          <a href="#" className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.001-.104z"/>
            </svg>
          </a>
          <a href="#" className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
          </a>
          <a href="#" className="text-secondary dark:text-gray-300 hover:text-alert dark:hover:text-alert transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}