import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";

export default function ClashCard({ title, statement, argument, argumentCount = 0, reactions, expires_at, tags = [], createdAt, creator }) {
  const mockReactions = [
    { emoji: "👑", label: "Nailed It", description: "Fully agree" },
    { emoji: "🤝", label: "Fair Point", description: "Somewhat agree" },
    { emoji: "🤷", label: "Can’t Decide", description: "Neutral stance" },
    { emoji: "🙄", label: "Really?", description: "Skeptical" },
    { emoji: "🗑️", label: "Try Again", description: "Not convinced" }
  ];
  const safeReactions = Array.isArray(reactions) && reactions.length > 0 ? reactions : mockReactions;
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

  // Share butonuna hover
  const handleShareButtonHover = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu("share");
    }, 100); // 100ms gecikme ile menüyü aç (daha hızlı)
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
    setSelectedReaction(reaction);
    setActiveMenu(null);
    // Burada seçilen reaksiyonu backend'e gönderme işlemi yapılabilir
    console.log(`Selected reaction: ${reaction.emoji} - ${reaction.label}`);
  };

  // Report işlemi
  const handleReport = () => {
    console.log("Clash reported");
    setShowDropdown(false);
    // Burada gerçek bir raporlama işlemi yapılabilir
    alert("Clash has been reported");
  };

  // Arguments button click handler
  const handleArgumentsClick = () => {
    console.log("Go to argument details");
  };

  useEffect(() => {
    console.log("RAW createdAt from props:", createdAt);
    if (createdAt && typeof createdAt === "string") {
      try {
        const parsedDate = new Date(createdAt);
        console.log("Parsed createdAt:", parsedDate.toISOString());
      } catch (err) {
        console.error("Error parsing createdAt:", err);
      }
    }
  }, [createdAt]);
  console.log("createdAt:", createdAt);
  return (
    <div className="bg-bgwhite dark:bg-secondary rounded-2xl shadow-md border border-muted dark:border-muted-dark overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={(creator?.profileImage) || "https://randomuser.me/api/portraits/women/1.jpg"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-body text-secondary">@{creator?.username || "anonymous"}</span>
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
              <button 
                className="flex w-full items-center px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={handleReport}
              >
                <span className="mr-2">⚠️</span>
                <span>Report</span>
              </button>
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
        {/* Küçük başlık */}
        <div className="flex items-center space-x-2 text-label text-secondary">
          <span className="w-8 h-8 rounded-full bg-muted25 flex items-center justify-center text-body">⚔️</span>
          <span className="text-body font-bold">{title}</span>
        </div>
        {/* Clash info block */}
        {(() => {
          const expires = new Date(expires_at);
          if (!expires_at || !(expires instanceof Date) || isNaN(expires.getTime())) {
            return (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-caption whitespace-nowrap bg-muted25 text-secondary pl-2">
                  <span className="mr-1">⚠️</span>
                  <span>Invalid expiration date</span>
                </div>
                {tags && tags.length > 0 && tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-caption bg-muted25 text-secondary">
                    🏷️ {tag}
                  </span>
                ))}
              </div>
            );
          }

          const now = new Date();
          let timeDiffMs = expires - now;
          if (timeDiffMs < 0) timeDiffMs = 0;
          const timeDiffH = Math.floor(timeDiffMs / 1000 / 60 / 60);
          const timeDiffM = Math.floor((timeDiffMs / 1000 / 60) % 60);

          let info = "⚡ New Clash – ";
          let timePart = `Last ${timeDiffH}h ${timeDiffM}m to join.`;

          if (timeDiffMs <= 0) {
            info = "⏰ Finished Clash – ";
            timePart = "Time's up to join.";
          } else if (timeDiffH < 21) {
            info = "💥 Hot Clash – ";
            timePart = `Last ${timeDiffH}h ${timeDiffM}m to join.`;
          }

          let bgClass = "bg-muted25";
          let textClass = "text-secondary";

          return (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-caption whitespace-nowrap ${bgClass} ${textClass} pl-2`}>
                <span className="mr-1">{info.charAt(0)}</span>
                <span>
                  {info.slice(2)}
                  <span className="text-alert">{timePart}</span>
                </span>
              </div>
              {tags && tags.length > 0 && tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-caption bg-muted25 text-secondary">
                  🏷️ {tag}
                </span>
              ))}
            </div>
          );
        })()}

        {/* Removed second redundant static info block */}

        {/* Statement ve Argument */}
        <h2 className="text-subheading text-secondary mt-1">{statement}</h2>
        {argument && (
          <>

            <h3 className="text-body text-secondary mt-1">{argument}</h3>
          </>
        )}

        {/* Dotted Separator */}
        <div className="border-t border-dotted border-muted my-4" />

        {/* Removed animated message block */}

      </div>

      {/* Footer Aksiyonları (Refactored for mobile UX and alignment) */}
      <div className="px-4 pt-0 pb-4 space-y-2">
        <div className="flex justify-between gap-2">
          {/* React Button */}
          <div className="flex-1 relative" ref={menuRefs.current.react}>
            <button 
              className="w-full flex items-center justify-center gap-1 text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-2"
              onMouseEnter={handleReactButtonHover}
              onMouseLeave={handleButtonMouseLeave}
            >
              <span>{selectedReaction ? selectedReaction.emoji : "👊"}</span>
              <span>{selectedReaction ? selectedReaction.label : "React"}</span>
            </button>
            {activeMenu === "react" && (
              <div 
                className="absolute bottom-12 left-0 bg-white rounded-2xl shadow-lg p-3 z-50 transition-all duration-200 ease-out animate-fadeIn"
                onMouseEnter={() => setActiveMenu("react")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <div className="flex gap-3 justify-between">
                  {safeReactions.map((reaction, index) => (
                    <button
                      key={index}
                      className="flex flex-col items-center justify-center hover:scale-110 transition-transform p-1 hover:bg-muted25 rounded-lg"
                      onClick={() => handleReactionSelect(reaction)}
                      title={reaction.description}
                    >
                      <span className="text-xl mb-1">{reaction.emoji}</span>
                      <span className="text-xs text-mutedDark whitespace-nowrap">{reaction.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Arguments Button */}
          <div className="flex-1 relative" ref={menuRefs.current.arguments}>
            <button
              className="w-full flex items-center justify-center gap-1 text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-2"
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
                  {argumentCount === 0
                    ? "No arguments yet – strike the first one."
                    : `${argumentCount} arguments swang.`}
                </div>
              </div>
            )}
          </div>

          {/* Share Button */}
          <div className="flex-1 relative" ref={menuRefs.current.share}>
            <button 
              className="w-full flex items-center justify-center gap-1 text-caption text-secondary hover:text-mutedDark hover:scale-105 transition-transform hover:bg-muted25 rounded-md py-2" 
              onMouseEnter={handleShareButtonHover}
              onMouseLeave={handleButtonMouseLeave}
              onClick={copyToClipboard}
            >
              <span>🔗</span>
              <span>Share</span>
            </button>
            {activeMenu === "share" && (
              <div 
                className="absolute bottom-12 left-0 bg-white rounded-2xl shadow-lg p-3 z-50 transition-all duration-200 ease-out animate-fadeIn"
                onMouseEnter={() => setActiveMenu("share")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <div className="flex items-center space-x-2">
                  {copied ? (
                    <div className="flex items-center space-x-1 hover:scale-105 transition-transform">
                      <span className="text-xl">✅</span>
                      <span className="text-xs text-secondary whitespace-nowrap font-medium">Link Copied!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start hover:scale-105 transition-transform">
                      <span className="text-sm text-secondary truncate max-w-36">{clashUrl}</span>
                      <span className="text-xs text-mutedDark">Tap to copy</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Check This CTA */}
        <button className="w-full px-4 py-2 bg-primary text-label text-secondary border-b-4 border-primary rounded-lg hover:shadow-md hover:bg-opacity-75">
        Jump into the fire 🔥
        </button>
      </div>
    </div>
  );
}