import ClashArgumentsDisplay from "./ClashArgumentsDisplay";
import ClashShare from "./ClashShare";
import React, { useState, useEffect } from "react";
import ReactionPanel from "./ReactionPanel";
import { Link } from "react-router-dom";
import getStatusLabel from "../utils/statusLabel";
import ClashAuthorInfo from "./ClashAuthorInfo";
import ClashDropdownMenu from "./ClashDropdownMenu";
import ClashMetadataTags from "./ClashMetadataTags";
import ClashContentPreview from "./ClashContentPreview";
import ClashImageBanner from "./ClashImageBanner";
import { useDropdownMenus } from "../hooks/useDropdownMenus";
import { copyToClipboard } from "../utils/clipboard";
import { getRemainingTimeMessage } from "../utils/timeUtils";
import { useAuth } from '../context/AuthContext';

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
  const { user: authUser } = useAuth();
  const isLoggedIn = Boolean(authUser);
  const safeTitle = vs_title || "Untitled Clash";
  const safeStatement = vs_statement || "No statement provided.";
  const [latestArgs, setLatestArgs] = useState(Clash_arguments);
  const [isLoadingArgs, setIsLoadingArgs] = useState(false);
  
  // Fetch latest arguments when component mounts
  useEffect(() => {
    const fetchLatestArguments = async () => {
      try {
        setIsLoadingArgs(true);
        const response = await fetch(`/api/arguments?clashId=${_id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLatestArgs(data);
      } catch (error) {
        console.error("Error fetching latest arguments:", error);
        // Fallback to props if fetch fails
        setLatestArgs(Clash_arguments);
      } finally {
        setIsLoadingArgs(false);
      }
    };

    fetchLatestArguments();
  }, [_id, Clash_arguments]);
  
  // Standardized argument handling
  const argumentCount = Array.isArray(Clash_arguments) ? Clash_arguments.length : 0;
  
  const mockReactions = [
    { emoji: "👑", label: "Nailed It", description: "Fully agree" },
    { emoji: "🤝", label: "Fair Point", description: "Somewhat agree" },
    { emoji: "🤷", label: "Can't Decide", description: "Neutral stance" },
    { emoji: "🙄", label: "Really?", description: "Skeptical" },
    { emoji: "🗑️", label: "Try Again", description: "Not convinced" }
  ];
  
  // Calculate total reaction count
  const reactionCount = reactions && typeof reactions === "object"
    ? Object.values(reactions).reduce((acc, val) => acc + val, 0)
    : 0;

  // Use the dropdown menu hook
  const {
    showDropdown,
    activeMenu,
    copied,
    dropdownRef,
    menuRefs,
    setActiveMenu,
    setCopied,
    toggleDropdown,
    handleReactButtonHover,
    handleClashArgumentsButtonHover,
    handleButtonMouseLeave,
    menuTimeoutRef,
    copyTimeoutRef
  } = useDropdownMenus();
  
  // Dynamic clash URL
  const clashUrl = `${window.location.origin}/clash/${_id}`;
  const [selectedReaction, setSelectedReaction] = useState(null);

  // URL'yi kopyalama işlemi
  const handleCopyToClipboard = () => {
    copyToClipboard(clashUrl, setCopied, copyTimeoutRef);
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
        <ClashDropdownMenu
          isLoggedIn={isLoggedIn}
          onReport={handleReport}
          dropdownRef={dropdownRef}
          showDropdown={showDropdown}
          toggleDropdown={toggleDropdown}
        />
      </div>

      {/* Görsel + İçerik as Link */}
      <Link to={`/clash/${_id}`} className="block transition-colors duration-200">
        <ClashImageBanner />

        <div className="p-4 space-y-4">
          <ClashContentPreview
            title={safeTitle}
            statement={safeStatement}
            statusLabel={statusLabel}
            expires_at={expires_at}
            tags={tags}
          />
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
              user={authUser}
              initialReactions={reactions}
              onClose={() => setActiveMenu(null)}
              isGuest={!authUser || !authUser._id}
            />
          </div>

          {/* Clash Arguments Button */}
          <Link to={`/clash/${_id}#arguments-section`} className="flex-1">
            <ClashArgumentsDisplay
              Clash_arguments={latestArgs}
              isLoading={isLoadingArgs}
              onHover={handleClashArgumentsButtonHover}
              buttonRef={menuRefs.Clash_arguments}
            />
          </Link>

          {/* Share Button */}
          <div className="flex-1 relative" ref={menuRefs.share}>
            <ClashShare clashId={_id} />
          </div>
        </div>
      </div>
    </div>
  );
}