import React, { useState, useEffect, useRef } from "react";
import ClashCard from "./ClashCard";
import { useNavigate } from "react-router-dom";


const ClashFeed = ({ selectedTag, user }) => {
  // State değişkenleri
  const navigate = useNavigate();
  const [statement, setStatement] = useState("");
  const [titleValue, setTitleValue] = useState(""); // VS başlığı için yeni state
  console.log("ClashFeed props:", { user, titleValue });
  const [selectedSide, setSelectedSide] = useState("A");
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clashList, setClashList] = useState([]);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const isLoggedIn = Boolean(user);
  const [titleError, setTitleError] = useState("");
  const [statementError, setStatementError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Tag input state
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed.length > 20 || tags.length >= 5 || tags.includes(trimmed)) return;
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  // Sort by dropdown için state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState("new"); // default: new
  const sortMenuRef = useRef(null);

  // Fetch only once on mount (no infinite scroll)
  useEffect(() => {
    fetchClashes();
    // eslint-disable-next-line
  }, []);

  // Fetch only 20 items, once, and disable infinite scroll
  const fetchClashes = async () => {
    setIsLoading(true);
    try {
      const sortParam = sortOption === 'hot' || sortOption === 'finished' || sortOption === 'new' ? 'custom' : 'createdAt';
      const res = await fetch(
        `http://localhost:8080/api/clashes?sortField=${sortParam}&sortOrder=${sortParam === 'custom' ? 'custom' : -1}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError);
        setIsLoading(false);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("API response is not an array:", data);
        setIsLoading(false);
        return;
      }

      const transformedData = data.map(item => ({
        ...item,
        _id: String(item._id),
        vs_title: item.vs_title || item.title || "",
        vs_statement: item.vs_statement || item.statement || "",
        vs_argument: item.vs_argument || item.argument || "",
        creator: typeof item.creator === "object" && item.creator !== null ? item.creator : null
      })).filter(item => item.vs_title && item.vs_statement);

      setClashList(transformedData);
      setHasMore(false); // No more loading after initial batch
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

  // (Infinite scroll IntersectionObserver removed - infinite scroll disabled)

  // Initial fetch and also refetch when sortOption changes
  useEffect(() => {
    offsetRef.current = 0;
    setClashList([]);
    setHasMore(true);
    fetchClashes();
    // eslint-disable-next-line
  }, [sortOption]);

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
    // The rest is handled by the useEffect on sortOption
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

    setTitleError("");
    setStatementError("");

    if (!titleValue.trim()) {
      setTitleError("Please enter a title for your clash!");
      return;
    }

    if (!statement.trim()) {
      setStatementError("Please add your bold statement!");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for submission
      const clashData = {
        vs_title: titleValue,
        vs_statement: statement,
        side: selectedSide,
        tags: tags,
        creator: user?._id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 saat sonrası
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

      // Clear form and reset states
      handleClearForm();
      
      // Prepend the new clash to the current list, filtering out any duplicate _id
      setClashList(prev => {
        const filtered = prev.filter(item => String(item._id) !== String(result._id));
        return [result, ...filtered];
      });
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      alert("Failed to create clash. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear form function
  const handleClearForm = () => {
    setTitleValue("");
    setStatement("");
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
  
  // Success toast above main content
  return (
    <>
      {showSuccessMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 text-caption px-4 py-2 rounded shadow z-50 transition-all duration-300">
          ✅ Your clash has been released successfully!
        </div>
      )}
      <div className="min-h-screen bg-muted25 bg-[radial-gradient(circle,_#E0E2DB_1px,_transparent_1px)] bg-[length:12px_12px]">
      {/* Title and description above feed (moved above input area) */}
      <div className="px-4 pt-20 pb-1 mb-1">
        <h1 className="text-subheading text-secondary flex items-center gap-2">
          🔥 Clash Starts Here.
        </h1>
        <p className="text-label text-secondary opacity-50">
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
                Sign in to create a clash
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
              <div className="relative">
                <input
                  id="title-vs-input"
                  type="text"
                  placeholder="e.g. Xbox vs PlayStation"
                  className="w-full pr-10 px-3 py-2 bg-bgwhite rounded-3xl text-caption text-secondary border border-muted25 focus:outline-none"
                  value={titleValue}
                  onChange={handleTitleChange}
                  onKeyPress={handleKeyPress}
                  maxLength={80}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-mutedDark hover:text-secondary transition-colors"
                  onClick={getRandomVs}
                  type="button"
                  tabIndex={-1}
                >
                  🎲
                </button>
              </div>
              {titleError && (
                <p className="text-alert text-caption mt-1">{titleError}</p>
              )}
            </div>

            {/* Side selector buttons */}
            <div className="mb-4">
              <label className="block text-caption text-mutedDark mb-1">Pick your side</label>
              <div className="flex space-x-3">
                <button
                  className={`flex-1 py-2 px-3 rounded-2xl text-caption border ${
                    selectedSide === "A" 
                      ? "border-accent bg-accent text-white" 
                      : "border-accent text-secondary border-opacity-25 border-dashed"
                  }`}
                  onClick={() => handleSideChange("A")}
                >
                  <div className="flex items-center justify-between">
                    <span>{sideATitle}</span>
                    {selectedSide === "A" && <span>✓</span>}
                  </div>
                </button>
                <button
                  className={`flex-1 py-2 px-3 rounded-2xl text-caption border ${
                    selectedSide === "B" 
                      ? "border-accent bg-accent text-white" 
                      : "border-accent text-secondary border-opacity-25 border-dashed"
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

            {/* Statement input */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="statement-input" className="block text-caption text-mutedDark">
                  Statement
                </label>
                <button
                  className="text-caption text-mutedDark hover:text-secondary bg-transparent border-none"
                  onClick={generateMockStatement}
                  type="button"
                >
                  Get help from AI to create ✨
                </button>
              </div>
              <textarea
                id="statement-input"
                placeholder="Why do you think your side is better?"
                className="w-full bg-bgwhite rounded-3xl text-caption text-secondary border border-muted25 focus:outline-none resize-none px-3 py-2"
                rows="2"
                value={statement}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                maxLength={200}
              ></textarea>
              {statementError && (
                <p className="text-alert text-caption mt-1">{statementError}</p>
              )}
            </div>

            {/* Supporting argument removed */}

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
                      type="button"
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
                className="w-full bg-bgwhite rounded-3xl text-caption text-secondary border border-muted focus:outline-none px-3 py-2"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                maxLength={100}
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                className={`px-6 py-4 bg-accent text-bgashwhite text-label rounded-2xl ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}`}
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
      <div className="p-8 flex bg-bgashwhite justify-between items-center border-t border-muted mt-6">
        <h2 className="text-body text-secondary">Highlighted Clashes</h2>
        <div className="relative" ref={sortMenuRef}>
          <button 
            className="flex items-center space-x-1 text-caption text-mutedDark hover:text-secondary"
            onClick={toggleSortDropdown}
          >
            <span>Sort by:</span>
            <span className="font-medium text-secondary">
              {sortOption === 'hot' ? 'Hot' : sortOption === 'finished' ? 'Finished' : 'New'}
            </span>
            <span className="text-xs">▼</span>
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-20 w-36">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange('new')}
              >
                New
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange('hot')}
              >
                Hot
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange('finished')}
              >
                Finished
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clash list */}
      <div className="space-y-6 px-4 bg-bgashwhite">
        {/* <div className="px-4 text-sm text-secondary">
          Debug: {clashList.length} clashes loaded
        </div> */}
        {Array.isArray(clashList) && clashList.length > 0 ? clashList.map((clash) => {
          console.log("Rendering clash:", clash);
          return clash && clash._id ? (
            <div key={clash._id} className="mb-4">
              <ClashCard
                vs_title={clash.vs_title}
                vs_statement={clash.vs_statement}
                argument={clash.vs_argument || (clash.arguments?.[0]?.text || "")}
                argumentCount={clash.argumentCount}
                reactions={clash.reactions}
                tags={clash.tags}
                expires_at={clash.expires_at}
                createdAt={clash.createdAt}
                creator={clash.creator}
                user={user}
              />
            </div>
          ) : null;
        }) : (
          <div className="p-4 text-center text-body text-muted">
            {isLoading ? "Loading..." : "No clashes found. Create the first one!"}
          </div>
        )}
      </div>

      {/* Clash count info */}
      {clashList.length > 0 && (
        <div className="text-center text-caption text-muted py-2">
          Showing {clashList.length} clash{clashList.length > 1 ? "es" : ""}
        </div>
      )}
      {/* Loading indicator */}
      {hasMore && (
        <div 
          ref={loaderRef} 
          className="p-4 text-center text-body text-muted"
        >
          {isLoading && clashList.length > 0 ? "Loading more clashes..." : "Loader active"}
        </div>
      )}
      </div>
    </>
  );
};

export default ClashFeed;