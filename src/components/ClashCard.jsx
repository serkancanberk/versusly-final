import ClashArgumentsDisplay from "./ClashArgumentsDisplay";
import ClashShare from "./ClashShare";
import React, { useState, useEffect, useRef } from "react";
import ReactionPanel from "./ReactionPanel";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import getStatusLabel from "../utils/statusLabel";
import ClashAuthorInfo from "./ClashAuthorInfo";

export default function ClashCard({ 
  _id,
  vs_title, 
  vs_statement, 
  vs_argument,
  tags = [], 
  Clash_arguments = [], 
  reactions, 
  expires_at, 
  createdAt, 
  creator, 
  user,
  onReact,
  onShare,
  onArguments,
  isDetailView = false
}) {
  const isLoggedIn = Boolean(user);
  const safeTitle = vs_title || "Untitled Clash";
  const safeStatement = vs_statement || "No statement provided.";
  
  // Standardized argument handling
  const argumentCount = Array.isArray(Clash_arguments) ? Clash_arguments.length : 0;
  
  const mockReactions = [
    { emoji: "👑", label: "Nailed It", description: "Fully agree" },
    { emoji: "🤝", label: "Fair Point", description: "Somewhat agree" },
    { emoji: "🤷", label: "Can't Decide", description: "Neutral stance" },
    { emoji: "🙄", label: "Really?", description: "Skeptical" },
    { emoji: "🗑️", label: "Try Again", description: "Not convinced" }
  ];
  
  const safeReactions = reactions && typeof reactions === 'object' && Object.keys(reactions).length > 0 ? reactions : {};
  
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
  const [activeMenu, setActiveMenu] = useState(null); // "react", "share", "Clash_arguments" veya null
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuTimeoutRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const menuRefs = {
    react: useRef(null),
    share: useRef(null),
    Clash_arguments: useRef(null)
  };
  
  // Dynamic clash URL
  const clashUrl = `${window.location.origin}/clash/${_id}`;
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
      const insideReactMenu = menuRefs.react.current && 
                             menuRefs.react.current.contains(event.target);
      const insideShareMenu = menuRefs.share.current && 
                             menuRefs.share.current.contains(event.target);
      const insideClashArgumentsMenu = menuRefs.Clash_arguments.current &&
                                      menuRefs.Clash_arguments.current.contains(event.target);
      
      if (!insideReactMenu && !insideShareMenu && !insideClashArgumentsMenu) {
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


  // Clash Arguments butonuna hover
  const handleClashArgumentsButtonHover = () => {
    if (!isDetailView) {
      setActiveMenu("Clash_arguments");
    }
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
    const textToCopy = `${window.location.origin}/clash/${_id}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
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

  // Clash Arguments button click handler
  const handleClashArgumentsClick = () => {
    if (onArguments) {
      onArguments(_id);
    }
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

  const statusLabel = getStatusLabel({ expires_at, createdAt });

  return (
    <div className="bg-bgwhite dark:bg-secondary rounded-2xl shadow-md border border-muted dark:border-muted-dark overflow-hidden transition-colors duration-300 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <ClashAuthorInfo creator={creator} createdAt={createdAt} />
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

      {/* Görsel + İçerik as Link */}
      <Link to={`/clash/${_id}`} className="block transition-colors duration-200">
        <div className="w-full h-60 bg-muted25 dark:bg-zinc-800 flex items-center justify-center">
          <img
            src="/images/clash_card_final_design.png"
            alt="Clash Visual"
            className="object-cover w-full h-full"
          />
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="flex items-center space-x-2 text-label text-secondary w-full">
              <span className="w-8 h-8 rounded-full bg-muted25 flex items-center justify-center text-body">⚔️</span>
              <span className="text-body font-bold">{safeTitle}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-2 px-0">
            {statusLabel && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-caption bg-accent text-bgwhite">
                {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
              </span>
            )}
            {Array.isArray(tags) && tags.length > 0 && (() => {
              const displayedTags = tags.slice(0, 2);
              const remainingTagCount = tags.length - 2;
              return (
                <>
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
                </>
              );
            })()}
          </div>

          <h2 className="text-subheading text-secondary mt-1">{safeStatement}</h2>

          <div className="border-t border-dotted border-muted my-4" />
        </div>
      </Link>

      {/* Footer Aksiyonları */}
      <div className="px-4 pt-0 pb-4 space-y-2">
        <div className="flex justify-between gap-2">
          {/* React Button */}
          <div className="flex-1 relative" ref={menuRefs.react}>
            <ReactionPanel
              clashId={_id}
              user={user}
              initialReactions={safeReactions}
              onClose={() => setActiveMenu(null)}
              isGuest={!user || !user._id}
            />
          </div>

          {/* Clash Arguments Button */}
          <div className="flex-1">
            <ClashArgumentsDisplay
              argumentCount={argumentCount}
              Clash_arguments={Clash_arguments}
              onHover={handleClashArgumentsButtonHover}
              onClick={handleClashArgumentsClick}
              buttonRef={menuRefs.Clash_arguments}
            />
          </div>

          {/* Share Button */}
          <div className="flex-1 relative" ref={menuRefs.share}>
            <ClashShare clashId={_id} />
          </div>
        </div>

        {/* Check This CTA */}
        {/* <div className="w-full">
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
        </div> */}
      </div>

    </div>
  );
}