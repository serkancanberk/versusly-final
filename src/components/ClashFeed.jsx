import React, { useState, useEffect, useRef } from "react";
import ClashCard from "./ClashCard";
import { useNavigate } from "react-router-dom";

const mockUserId = "6620a0c1f3f6a6abc1234567"; // Mock user ID for testing

const ClashFeed = ({ selectedTag, user }) => {
  // State değişkenleri
  const navigate = useNavigate();
  const [statement, setStatement] = useState("");
  const [titleValue, setTitleValue] = useState(""); // VS başlığı için yeni state
  console.log("ClashFeed props:", { user, titleValue });
  const [supportingArgument, setSupportingArgument] = useState("");
  const [selectedSide, setSelectedSide] = useState("A");
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clashList, setClashList] = useState([]);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const isLoggedIn = Boolean(user);
  
  // Tag input state
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  // Tag input handlers
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  // Fetch clashes with pagination, sort option, and tag filter
  const fetchClashes = async () => {
    setIsLoading(true);
    try {
      // Add a short delay to make loading feel smoother
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1000ms delay
      const tagParam = selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : "";
      // Explicitly use the correct server path (not relying on relative paths)
      const res = await fetch(
        `http://localhost:8080/api/clashes?sort=${sortOption === 'hot' ? '-hotScore' : '-createdAt'}&limit=5&offset=${offsetRef.current}${tagParam}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await res.json();
      console.log("Fetched Clashes Raw:", data);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        const transformedData = data
          .filter(item => item.vs_title && item.vs_statement && item.vs_argument)
          .map(item => ({
            ...item,
            vs_title: item.vs_title || item.title || "Untitled Clash",
            vs_statement: item.vs_statement || item.statement || "No statement provided.",
            vs_argument: item.vs_argument || item.argument || "No argument yet.",
          }));
        setClashList(prev => [...prev, ...transformedData]);
        offsetRef.current += 5;
      }
    } catch (err) {
      console.error("Error fetching clashes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tag filter handler
  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
    setClashList([]);
    setHasMore(true);
    offsetRef.current = 0;
    fetchClashes();
  };

  // IntersectionObserver for lazy loading (refactored to avoid repeated triggering)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          fetchClashes();
        }
      },
      { threshold: 1.0 }
    );
    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, isLoading]);

  // Initial fetch
  useEffect(() => {
    offsetRef.current = 0;
    // eslint-disable-next-line
  }, []);
  
  // Sort by dropdown için state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState("newest"); // default: newest
  const sortMenuRef = useRef(null);

  // Side A ve Side B için dinamik başlıklar
  const [sideATitle, setSideATitle] = useState("Side A");
  const [sideBTitle, setSideBTitle] = useState("Side B");

  // Random VS örnekleri - Gerçek bir backend entegrasyonu için daha sonra güncellenecek
  const randomVsExamples = [
    "Netflix vs YouTube",
    "Instagram vs TikTok",
    "Pizza vs Burger",
    "Apple vs Samsung",
    "Football vs Basketball",
    "Coffee vs Tea",
    "Summer vs Winter",
    "Movies vs Books",
    "PlayStation vs Xbox",
    "Android vs iOS"
  ];

  // Rastgele bir VS çekme fonksiyonu
  const getRandomVs = () => {
    const randomIndex = Math.floor(Math.random() * randomVsExamples.length);
    const randomVs = randomVsExamples[randomIndex];
    setTitleValue(randomVs);
    // Title değiştiğinde Side A ve Side B başlıklarını güncelle
    updateSideTitles(randomVs);
  };

  // Input alanı değiştiğinde state'i güncelleyen fonksiyon
  const handleInputChange = (event) => {
    setStatement(event.target.value);
  };

  // Title alanı değiştiğinde state'i güncelleyen fonksiyon
  const handleTitleChange = (event) => {
    setTitleValue(event.target.value);
    // Title değiştiğinde Side A ve Side B başlıklarını güncelle
    updateSideTitles(event.target.value);
  };

  // Enter tuşuna basıldığında form geçişini sağlayan fonksiyon
  const handleKeyPress = (event) => {
    if (!isLoggedIn) return;
    
    // Enter tuşuna basıldığında ve input alanında değer varsa
    if (event.key === "Enter") {
      // Eğer basit form gösteriliyorsa ve title alanında değer varsa detaylı forma geç
      if (!showDetailedForm && titleValue.trim() !== "") {
        handleStartNewClash();
      } 
      // Eğer detaylı formda ise, sırayla alanlar arasında geçiş yap
      else if (showDetailedForm) {
        if (event.target.id === "title-vs-input" && titleValue.trim() !== "") {
          document.getElementById("statement-input").focus();
        } else if (event.target.id === "statement-input") {
          document.getElementById("supporting-argument-input").focus();
        } else if (event.target.id === "supporting-argument-input" && titleValue.trim() !== "") {
          handleReleaseClash();
        }
      }
    }
  };

  // Supporting argument değiştiğinde çalışacak fonksiyon
  const handleSupportingArgChange = (event) => {
    setSupportingArgument(event.target.value);
  };

  // Side seçimi değiştiğinde çalışacak fonksiyon
  const handleSideChange = (side) => {
    setSelectedSide(side);
  };

  // Kullanıcının girdisine göre Side A ve Side B başlıklarını güncelleme
  const updateSideTitles = (text) => {
    // "vs", "veya", "vs.", "or", "-" gibi ayrıcılar aranabilir
    const dividers = [' vs ', ' vs. ', ' veya ', ' or ', ' - ', ' mi yoksa ', ' against '];
    
    let foundMatch = false;
    
    for (const divider of dividers) {
      if (text.toLowerCase().includes(divider)) {
        // Metni ayırıcıya göre böl
        const parts = text.split(divider);
        if (parts.length >= 2) {
          // En fazla 10 karakter al
          const sideA = parts[0].trim().split(' ').pop();
          const sideB = parts[1].trim().split(' ')[0];
          
          setSideATitle(sideA.length > 10 ? sideA.substring(0, 10) + '...' : sideA);
          setSideBTitle(sideB.length > 10 ? sideB.substring(0, 10) + '...' : sideB);
          foundMatch = true;
          break;
        }
      }
    }
    
    // Özel durum: "X'i Y'ye tercih ederim" yapısı
    if (!foundMatch && text.includes("tercih ederim")) {
      const parts = text.split("tercih ederim");
      if (parts.length > 0) {
        const preferParts = parts[0].split("'");
        if (preferParts.length >= 3) { // X'i Y'ye formatında
          const sideA = preferParts[0].trim().split(' ').pop();
          const sideB = preferParts[2].trim().split(' ')[0].replace("ye", "").replace("ya", "");
          
          setSideATitle(sideA.length > 10 ? sideA.substring(0, 10) + '...' : sideA);
          setSideBTitle(sideB.length > 10 ? sideB.substring(0, 10) + '...' : sideB);
          foundMatch = true;
        }
      }
    }
    
    // Eğer bir eşleşme bulunamadıysa varsayılan değerlere geri dön
    if (!foundMatch && text.length === 0) {
      setSideATitle("Side A");
      setSideBTitle("Side B");
    }
  };

  // Sort by dropdown'ı aç/kapat
  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  // Sort seçeneğini ayarla
  const handleSortOptionChange = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
    setClashList([]);
    setHasMore(true);
    offsetRef.current = 0;
    fetchClashes();
  };

  // Start new clash function - simple form -> detailed form
  const handleStartNewClash = () => {
    if (!isLoggedIn) return;
    setShowDetailedForm(true);
    setTimeout(() => {
      document.getElementById("supporting-argument-input")?.focus();
    }, 100);
  };

  // Release clash function - submit detailed form
  const handleReleaseClash = async () => {
    if (!isLoggedIn) return;
    
    if (!titleValue.trim()) {
      alert("Please enter a title for your clash!");
      return;
    }

    if (!supportingArgument.trim()) {
      alert("Please provide a supporting argument!");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for submission
      const clashData = {
        title: titleValue,
        statement: statement || titleValue, // Use title if statement is empty
        side: selectedSide,
        argument: supportingArgument, 
        tags: tags,
        userId: user._id // Use the actual user ID from the user prop
      };

      // Send POST request to create clash
      const response = await fetch("http://localhost:8080/api/clashes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies with the request
        body: JSON.stringify(clashData),
      });

      if (!response.ok) {
        throw new Error("Failed to create clash");
      }

      const result = await response.json();
      console.log("Clash created:", result);

      // Clear form and reset states
      handleClearForm();
      
      // Refresh the clash list to include the new clash
      setClashList([]);
      setHasMore(true);
      offsetRef.current = 0;
      fetchClashes();
      
    } catch (error) {
      console.error("Error creating clash:", error);
      alert("Failed to create clash. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear form function
  const handleClearForm = () => {
    setTitleValue("");
    setStatement("");
    setSupportingArgument("");
    setSelectedSide("A");
    setShowDetailedForm(false);
    setTags([]);
  };

  // Side title edit handler
  const handleEditSideTitle = (side, event) => {
    if (side === "A") {
      setSideATitle(event.target.value);
    } else {
      setSideBTitle(event.target.value);
    }
  };

  // Mock statement generator
  const generateMockStatement = () => {
    const statements = [
      "This is clearly the superior option because of its innovation.",
      "I've tried both, and there's no comparison - this one wins every time.",
      "The quality and experience are incomparable.",
      "Anyone who's spent time with both knows there's only one real choice.",
      "The features and capabilities make this the obvious choice."
    ];
    
    const randomIndex = Math.floor(Math.random() * statements.length);
    setStatement(statements[randomIndex]);
  };
  
  // Effect to fetch clashes when filters change or on initial load
  useEffect(() => {
    fetchClashes();
    // eslint-disable-next-line
  }, [selectedTag]);

  return (
    <div className="min-h-screen bg-muted25">
      {/* Title and description above feed (moved above input area) */}
      <div className="px-4 pt-20 pb-1 mb-1">
        <h1 className="text-subheading text-secondary flex items-center gap-2">
          🔥 Clash Starts Here.
        </h1>
        <p className="text-caption text-mutedDark">
          Your bold statement meets its rival. AI scores both sides. The crowd decides.
        </p>
      </div>

      {/* Input alanı */}
      <div className="sticky top-0 z-10 px-4 py-6">
        {/* Basit Form */}
        {!showDetailedForm && (
          <div className="relative group">
            <div className="relative bg-bgwhite rounded-3xl flex items-center px-4 py-2">
              <input
                type="text"
                placeholder="What's your VS today? (e.g. Xbox vs PlayStation)"
                className={`flex-grow bg-transparent border-none focus:outline-none text-caption text-secondary ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={titleValue}
                onChange={handleTitleChange}
                onKeyPress={handleKeyPress}
                disabled={!isLoggedIn}
              />
              <div className="flex space-x-2">
                <button
                  className={`text-mutedDark hover:text-secondary transition-colors ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={getRandomVs}
                  disabled={!isLoggedIn}
                >
                  🎲
                </button>
                <button
                  className={`bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleStartNewClash}
                  disabled={!isLoggedIn}
                >
                  ⚔️
                </button>
              </div>
            </div>
            {!isLoggedIn && (
              <div className="absolute left-0 bottom-full mb-2 bg-secondary text-white text-caption px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Login to create a clash
              </div>
            )}
          </div>
        )}

        {/* Detaylı Form */}
        {showDetailedForm && (
          <div className="bg-white rounded-lg p-4 shadow-lg">
            {/* Form başlığı */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-body font-semibold text-secondary">Create New VS</h3>
              <button 
                className="text-mutedDark hover:text-alert"
                onClick={handleClearForm}
              >
                ✕
              </button>
            </div>

            {/* VS başlığı */}
            <div className="mb-4">
              <label htmlFor="title-vs-input" className="block text-caption text-mutedDark mb-1">Title of VS</label>
              <div className="flex space-x-2">
                <input
                  id="title-vs-input"
                  type="text"
                  placeholder="e.g. Xbox vs PlayStation"
                  className="w-full px-3 py-2 border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                  value={titleValue}
                  onChange={handleTitleChange}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className="text-mutedDark hover:text-secondary transition-colors"
                  onClick={getRandomVs}
                >
                  🎲
                </button>
              </div>
            </div>

            {/* Side selector buttons */}
            <div className="mb-4">
              <label className="block text-caption text-mutedDark mb-1">Pick your side</label>
              <div className="flex space-x-3">
                <button
                  className={`flex-1 py-2 px-3 rounded-md border ${
                    selectedSide === "A" 
                      ? "border-accent bg-accent text-white" 
                      : "border-muted text-secondary"
                  }`}
                  onClick={() => handleSideChange("A")}
                >
                  <div className="flex items-center justify-between">
                    <span>{sideATitle}</span>
                    {selectedSide === "A" && <span>✓</span>}
                  </div>
                </button>
                <button
                  className={`flex-1 py-2 px-3 rounded-md border ${
                    selectedSide === "B" 
                      ? "border-alert bg-alert text-white" 
                      : "border-muted text-secondary"
                  }`}
                  onClick={() => handleSideChange("B")}
                >
                  <div className="flex items-center justify-between">
                    <span>{sideBTitle}</span>
                    {selectedSide === "B" && <span>✓</span>}
                  </div>
                </button>
              </div>
            </div>

            {/* Statement input (optional) */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="statement-input" className="block text-caption text-mutedDark">
                  Statement (optional)
                </label>
                <button
                  className="text-caption text-mutedDark hover:text-secondary bg-transparent border-none"
                  onClick={generateMockStatement}
                >
                  Generate ✨
                </button>
              </div>
              <textarea
                id="statement-input"
                placeholder="Why do you think your side is better?"
                className="w-full px-3 py-2 border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                rows="2"
                value={statement}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              ></textarea>
            </div>

            {/* Supporting argument */}
            <div className="mb-4">
              <label htmlFor="supporting-argument-input" className="block text-caption text-mutedDark mb-1">
                Supporting argument
              </label>
              <textarea
                id="supporting-argument-input"
                placeholder="Make your case! What's your supporting argument?"
                className="w-full px-3 py-2 border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                rows="3"
                value={supportingArgument}
                onChange={handleSupportingArgChange}
                onKeyPress={handleKeyPress}
              ></textarea>
            </div>

            {/* Tags input */}
            <div className="mb-4">
              <label htmlFor="tags-input" className="block text-caption text-mutedDark mb-1">
                Tags (optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted25 text-mutedDark">
                    {tag}
                    <button 
                      className="ml-1 text-mutedDark hover:text-alert"
                      onClick={() => handleTagRemove(tag)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <input
                id="tags-input"
                type="text"
                placeholder="Add tags separated by comma or Enter"
                className="w-full px-3 py-2 border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                className={`px-4 py-2 bg-accent text-white rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}`}
                onClick={handleReleaseClash}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Release Clash ⚔️"}
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Sort dropdown and options */}
      <div className="p-4 flex bg-bgashwhite justify-between items-center border-t border-muted mt-6">
        <h2 className="text-body text-secondary">Clash Feed</h2>
        <div className="relative" ref={sortMenuRef}>
          <button 
            className="flex items-center space-x-1 text-caption text-mutedDark hover:text-secondary"
            onClick={toggleSortDropdown}
          >
            <span>Sort by:</span>
            <span className="font-medium text-secondary">{sortOption === 'hot' ? 'Hot' : 'Newest'}</span>
            <span className="text-xs">▼</span>
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-20 w-36">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange('newest')}
              >
                Newest
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange('hot')}
              >
                Hot
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clash list */}
      <div className="space-y-6 px-4 bg-bgashwhite">
        {clashList.length > 0 && clashList.map((clash, index) => (
          <div key={clash._id || index}>
            <ClashCard
              vs_title={clash.vs_title}
              vs_statement={clash.vs_statement}
              argument={clash.vs_argument}
              argumentCount={clash.argumentCount}
              reactions={clash.reactions}
              tags={clash.tags}
              expires_at={clash.expires_at}
              createdAt={clash.createdAt}
              creator={clash.creator}
              user={user}
            />
          </div>
        ))}
        {!isLoading && clashList.length === 0 && (
          <div className="p-4 text-center text-body text-muted">
            No clashes found. Create the first one!
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {hasMore && (
        <div 
          ref={loaderRef} 
          className="p-4 text-center text-body text-muted"
        >
          {isLoading && clashList.length > 0 ? "Loading more clashes..." : ""}
        </div>
      )}
    </div>
  );
};

export default ClashFeed;