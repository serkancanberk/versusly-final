import React, { useState, useEffect, useRef } from "react";
import ReactionPanel from "./ReactionPanel";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import getStatusLabel from "../utils/statusLabel";

export default function ClashCard({ 
  _id,
  vs_title, 
  vs_statement, 
  tags = [], 
  clashArguments = [], 
  reactions, 
  expires_at, 
  createdAt, 
  creator, 
  user
}) {
  const isLoggedIn = Boolean(user);
  const safeTitle = vs_title || "Untitled Clash";
  const safeStatement = vs_statement || "No statement provided.";
  
  // Standardized argument handling
  const safeArguments = Array.isArray(clashArguments) ? clashArguments : [];
  const argumentCount = safeArguments.length;
  const safeArgument = argumentCount > 0 ? safeArguments[0].text : "";
  
  const mockReactions = [
    { emoji: "👑", label: "Nailed It", description: "Fully agree" },
    { emoji: "🤝", label: "Fair Point", description: "Somewhat agree" },
    { emoji: "🤷", label: "Can't Decide", description: "Neutral stance" },
    { emoji: "🙄", label: "Really?", description: "Skeptical" },
    { emoji: "🗑️", label: "Try Again", description: "Not convinced" }
  ];
  
  const safeReactions = Array.isArray(reactions) && reactions.length > 0 ? reactions : mockReactions;
  
  // Calculate total reaction count
  const reactionCount = reactions && typeof reactions === "object"
    ? Object.values(reactions).reduce((acc, val) => acc + val, 0)
    : 0;

  const messages = [
    { icon: "⚡", text: "This is a New Clash" },
    { icon: "🤺", text: "No arguments yet – strike the first one." },
    { icon: "🧨", text: "Time has been ticking: Last 12h 23m to join." }
  ];


  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  // Dropdown menüsü için state
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Menu yönetimi için state
  const [activeMenu, setActiveMenu] = useState(null); // "react", "share", "arguments" veya null
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuTimeoutRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const menuRefs = useRef({
    react: useRef(null),
    share: useRef(null),
    arguments: useRef(null)
  });
  
  // Örnek clash URL
  const clashUrl = "https://versusly.co/c/abc123";
  const [selectedReaction, setSelectedReaction] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Önce görünürlüğü kapat
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length); // Sonra yeni mesaj
        setFade(true); // Sonra görünürlüğü aç
      }, 300); // 300ms fade out süresi
    }, 3000); // 3 saniyede bir geçiş

    return () => clearInterval(interval);
  }, []);

  // Click ve key event handler'ları
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      
      // Tüm menü referansları için kontrol
      const insideReactMenu = menuRefs.current.react.current && 
                             menuRefs.current.react.current.contains(event.target);
      const insideShareMenu = menuRefs.current.share.current && 
                             menuRefs.current.share.current.contains(event.target);
      const insideArgumentsMenu = menuRefs.current.arguments.current &&
                                  menuRefs.current.arguments.current.contains(event.target);
      
      if (!insideReactMenu && !insideShareMenu && !insideArgumentsMenu) {
        setActiveMenu(null);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      
      // Timeout'ları temizle
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Dropdown menüsünü aç/kapat
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // React butonuna hover
  const handleReactButtonHover = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu("react");
    }, 300); // 300ms gecikme ile menüyü aç
  };


  // Arguments butonuna hover
  const handleArgumentsButtonHover = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu("arguments");
    }, 300); // 300ms gecikme ile menüyü aç
  };

  // Herhangi bir butondan mouse ayrıldığında
  const handleButtonMouseLeave = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    
    // Butondan çıkınca menü kapanmasın, kullanıcı menüye gidebilir
  };

  // URL'yi kopyalama işlemi
  const copyToClipboard = () => {
    navigator.clipboard.writeText(clashUrl)
      .then(() => {
        setCopied(true);
        
        // 2 saniye sonra copied state'ini sıfırla
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        
        copyTimeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };
  
  // Reaksiyon seçme işlemi
  const handleReactionSelect = (reaction) => {
    if (!isLoggedIn) return;

    if (selectedReaction?.label === reaction.label) {
      setSelectedReaction(null); // deselect if same reaction clicked again
    } else {
      setSelectedReaction(reaction); // new selection
    }

    setActiveMenu(null);
    // Backend sync logic can go here if needed
  };

  // Report işlemi
  const handleReport = () => {
    if (!isLoggedIn) return;
    setShowDropdown(false);
    // Burada gerçek bir raporlama işlemi yapılabilir
    alert("Clash has been reported");
  };

  // Arguments button click handler
  const handleArgumentsClick = () => {
    // Intentionally left blank or add navigation logic here
  };

  useEffect(() => {
    if (createdAt && typeof createdAt === "string") {
      try {
        const parsedDate = new Date(createdAt);
        // parsedDate can be used for further logic if needed
      } catch (err) {
        console.error("Error parsing createdAt:", err);
      }
    }
  }, [createdAt]);

  // Debug tags prop
  useEffect(() => {
    // tags effect, can be used for further logic if needed
  }, [tags]);

  return (
    <div className="bg-bgwhite dark:bg-secondary rounded-2xl shadow-md border border-muted dark:border-muted-dark overflow-hidden transition-colors duration-300 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={creator?.picture || "https://randomuser.me/api/portraits/men/75.jpg"}
            alt={creator?.name || "Profile"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-body text-secondary">
              {creator?.name || "anonymous"}
            </span>
            <span className="text-caption text-mutedDark">
              {(() => {
                const date = new Date(createdAt);
                return date instanceof Date && !isNaN(date.getTime())
                  ? formatDistanceToNow(date, { addSuffix: true })
                  : "sometime ago";
              })()}
            </span>
          </div>
        </div>
        {/* Üç nokta menüsü */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className="text-xl text-secondary hover:text-mutedDark"
            onClick={toggleDropdown}
          >
            ⋮
          </button>
          
          {/* Dropdown Menü */}
          {showDropdown && (
            <div className="absolute right-0 mt-1 py-2 w-40 bg-white rounded-md shadow-lg z-20">
              {isLoggedIn ? (
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-secondary hover:bg-muted25"
                  onClick={handleReport}
                >
                  <span className="mr-2">⚠️</span>
                  <span>Report</span>
                </button>
              ) : (
                <div className="relative group">
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-secondary opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <span className="mr-2">⚠️</span>
                    <span>Report</span>
                  </button>
                  <div className="absolute right-full mr-2 top-0 bg-secondary text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Login required
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Görsel */}
      <div className="w-full h-60 bg-muted25 dark:bg-zinc-800 flex items-center justify-center">
        <img
          src="/images/clash_card_final_design.png"
          alt="Clash Visual"
          className="object-cover w-full h-full"
        />
      </div>

      {/* İçerik */}
      <div className="p-4 space-y-4">
        {/* Title and Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="flex items-center space-x-2 text-label text-secondary">
            <span className="w-8 h-8 rounded-full bg-muted25 flex items-center justify-center text-body">⚔️</span>
            <span className="text-body font-bold">{safeTitle}</span>
          </div>
          {Array.isArray(tags) && tags.length > 0 && (
            (() => {
              const displayedTags = tags.slice(0, 2);
              const remainingTagCount = tags.length - 2;
              return (
                <div className="flex flex-wrap gap-2">
                  {displayedTags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-caption bg-muted25 text-secondary">
                      🏷️ {tag}
                    </span>
                  ))}
                  {remainingTagCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-caption bg-muted25 text-secondary">
                      +{remainingTagCount}
                    </span>
                  )}
                </div>
              );
            })()
          )}
        </div>

        {/* Clash info block */}
        {(() => {
          const status = getStatusLabel({ 
            createdAt, 
            expires_at, 
            argumentCount, // Using standardized argumentCount
            reactions 
          });
          let emoji = "⚡";
          if (status === "hot") emoji = "🤯";
          else if (status === "finished") emoji = "⏰";

          let timePart = "";
          if (status === "finished") {
            timePart = "Time's up to join.";
          } else {
            const expires = new Date(expires_at);
            const now = new Date();
            let timeDiffMs = expires - now;
            if (timeDiffMs < 0) timeDiffMs = 0;
            const timeDiffH = Math.floor(timeDiffMs / 1000 / 60 / 60);
            const timeDiffM = Math.floor((timeDiffMs / 1000 / 60) % 60);
            timePart = `Last ${timeDiffH}h ${timeDiffM}m to join.`;
          }

          return (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-caption whitespace-nowrap bg-muted25 text-secondary pl-2">
                <span className="mr-1 font-sans not-italic" role="img" aria-label="icon">{emoji}</span>
                <span>
                  {status.charAt(0).toUpperCase() + status.slice(1)} Clash – <span className="text-alert">{timePart}</span>
                </span>
              </div>
            </div>
          );
        })()}

        {/* Statement and Argument */}
        <h2 className="text-subheading text-secondary mt-1">{safeStatement}</h2>
        {safeArgument && (
          <h3 className="text-body text-secondary mt-1">{safeArgument}</h3>
        )}

        {/* Dotted Separator */}
        <div className="border-t border-dotted border-muted my-4" />
      </div>

      {/* Footer Aksiyonları */}
      <div className="px-4 pt-0 pb-4 space-y-2">
        <div className="flex justify-between gap-2">
          {/* React Button */}
          <div className="flex-1 relative" ref={menuRefs.current.react}>
            <ReactionPanel
              user={user}
              reactions={reactions}
              selectedReaction={selectedReaction}
              onSelect={handleReactionSelect}
              onClose={() => setActiveMenu(null)}
              isGuest={!user || !user._id}
            />
          </div>

          {/* Arguments Button */}
          <div className="flex-1 relative" ref={menuRefs.current.arguments}>
            <div className="relative group w-full">
              <button
                className="w-full flex items-center justify-center gap-1 text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-4"
                onMouseEnter={handleArgumentsButtonHover}
                onMouseLeave={handleButtonMouseLeave}
                onClick={handleArgumentsClick}
              >
                <span>🤺</span>
                <span>Args ({argumentCount})</span>
              </button>
              {activeMenu === "arguments" && (
                <div
                  className="absolute bottom-12 left-0 bg-white rounded-2xl shadow-lg p-3 z-50 transition-all duration-200 ease-out animate-fadeIn max-w-xs"
                  onMouseEnter={() => setActiveMenu("arguments")}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div className="text-caption text-secondary whitespace-nowrap">
                    {argumentCount === 0 ? (
                      "No arguments yet – strike the first one."
                    ) : (
                      <>
                        {`${argumentCount} argument${argumentCount === 1 ? '' : 's'} swang.`}
                        <div className="mt-1 text-mutedDark italic">
                          💬 {safeArguments[argumentCount - 1]?.text?.slice(0, 25)}...
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Button */}
          <div className="flex-1 relative" ref={menuRefs.current.share}>
            <button
              className="w-full flex items-center justify-center gap-1 text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-4"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={copyToClipboard}
            >
              <span>🔗</span>
              <span>{copied ? "Link copied!" : hovered ? "Tap to copy" : "Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* Check This CTA */}
        <div className="w-full">
          <div className="relative group w-full">
            {_id && (
              <Link
                to={`/clash/${_id}`}
                className="w-full px-4 py-2 bg-primary text-label text-secondary border-b-4 border-primary rounded-lg hover:shadow-md hover:bg-opacity-75 block text-center"
              >
                Jump into the fire 🔥
              </Link>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}