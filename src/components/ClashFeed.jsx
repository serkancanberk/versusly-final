import React, { useState, useEffect, useRef } from "react";
import ClashCard from "./ClashCard";
import { useNavigate } from "react-router-dom";
import getStatusLabel from "../utils/statusLabel";

const ClashFeed = ({ selectedTag, user }) => {
  // State değişkenleri
  // Rate limit for releasing clash
  const lastClashTimestampRef = useRef(0);
  const navigate = useNavigate();
  const [statement, setStatement] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [selectedSide, setSelectedSide] = useState("A");
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allClashes, setAllClashes] = useState([]); // Store all clashes
  const [filteredClashes, setFilteredClashes] = useState([]); // Store filtered clashes
  const [visibleClashes, setVisibleClashes] = useState([]); // Store currently visible clashes
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const CHUNK_SIZE = 5; // Number of items to load at once
  const isLoggedIn = Boolean(user);
  const [titleError, setTitleError] = useState("");
  const [statementError, setStatementError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Tag input state
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // AI loading field state: "title", "statement", or "tags"
  const [aiLoadingField, setAiLoadingField] = useState(null);

  // Filter by dropdown için state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState("all"); // default: all
  const sortMenuRef = useRef(null);

  // New state for loading feedback
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // New state for completion feedback
  const [allItemsLoaded, setAllItemsLoaded] = useState(false);

  // Fetch clashes and apply status labels
  const fetchClashes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/clashes`,
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

      const transformedData = data.map(item => {
        // Standardized argument handling
        const clashArguments = Array.isArray(item.arguments) ? item.arguments : [];
        const argumentCount = clashArguments.length;

        return {
          ...item,
          _id: String(item._id),
          vs_title: item.vs_title || item.title || "",
          vs_statement: item.vs_statement || item.statement || "",
          vs_argument: item.vs_argument || item.argument || "",
          clashArguments, // Renamed from arguments to clashArguments
          argumentCount, // Add explicit count
          creator: typeof item.creator === "object" && item.creator !== null ? item.creator : null,
          statusLabel: getStatusLabel({ 
            createdAt: item.createdAt, 
            expires_at: item.expires_at, 
            argumentCount, 
            reactions: item.reactions 
          })
        };
      }).filter(item => item.vs_title && item.vs_statement);

      setAllClashes(transformedData);
      setHasMore(false);
    } catch (err) {
      console.error("Error fetching clashes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter clashes based on sortOption
  useEffect(() => {
    let filtered = [...allClashes];
    
    switch (sortOption) {
      case "hot":
        filtered = allClashes.filter(clash => clash.statusLabel === "hot");
        break;
      case "new":
        filtered = allClashes.filter(clash => clash.statusLabel === "new");
        break;
      case "finished":
        filtered = allClashes.filter(clash => clash.statusLabel === "finished");
        break;
      case "all":
      default:
        // Sort all clashes by status: hot -> new -> finished
        filtered.sort((a, b) => {
          const statusOrder = { hot: 0, new: 1, finished: 2 };
          return statusOrder[a.statusLabel] - statusOrder[b.statusLabel];
        });
        break;
    }

    setFilteredClashes(filtered);
    setOffset(0); // Reset offset when filter changes
    setVisibleClashes(filtered.slice(0, CHUNK_SIZE)); // Show first chunk
    setHasMore(filtered.length > CHUNK_SIZE); // Update hasMore based on remaining items
  }, [sortOption, allClashes]);

  // Load more items when scrolling
  const loadMoreItems = async () => {
    if (!hasMore || isLoading || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextOffset = offset + CHUNK_SIZE;
    const nextItems = filteredClashes.slice(nextOffset, nextOffset + CHUNK_SIZE);
    
    if (nextItems.length > 0) {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter out any potential duplicates
      setVisibleClashes(prev => {
        const existingIds = new Set(prev.map(item => item._id));
        const newItems = nextItems.filter(item => !existingIds.has(item._id));
        return [...prev, ...newItems];
      });
      
      setOffset(nextOffset);
      const hasMoreItems = nextOffset + CHUNK_SIZE < filteredClashes.length;
      setHasMore(hasMoreItems);
      setAllItemsLoaded(!hasMoreItems);
    } else {
      setHasMore(false);
      setAllItemsLoaded(true);
    }
    
    setIsLoadingMore(false);
  };

  // Intersection Observer setup with adjusted sensitivity
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems();
        }
      },
      {
        root: null,
        rootMargin: "300px", // Increased margin for earlier trigger
        threshold: 0.1,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, offset, filteredClashes]);

  // Reset loading states when filter changes
  useEffect(() => {
    setAllItemsLoaded(false);
    setIsLoadingMore(false);
  }, [sortOption]);

  // Initial fetch
  useEffect(() => {
    fetchClashes();
    // eslint-disable-next-line
  }, []);

  // Tag filter handler
  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
    fetchClashes();
  };

  // Filter by dropdown'ı aç/kapat
  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  // Sort seçeneğini ayarla
  const handleSortOptionChange = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

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

    // Enhanced statement validation
    if (!statement.trim()) {
      setStatementError("Please add your bold statement!");
      return;
    }
    
    // Check statement length
    if (statement.trim().length < 10) {
      setStatementError("Your statement is too short. Please be more descriptive.");
      return;
    }

    // Rate limit: prevent posting more than once per 60 seconds
    const now = Date.now();
    const MIN_INTERVAL = 60000; // 60 seconds
    if (now - lastClashTimestampRef.current < MIN_INTERVAL) {
      alert("You're posting too frequently. Please wait a bit before creating another clash.");
      return;
    }
    lastClashTimestampRef.current = now;

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
      setAllClashes(prev => {
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
  
  // Enhanced tag input validation
  const handleTagInputKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      
      // Check for empty or duplicate tags
      if (!newTag || tags.includes(newTag)) {
        setTagInput("");
        return;
      }
      
      if (newTag.length > 20 || tags.length >= 5) return;
      
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  // Tag input change handler
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
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
              <div className="flex space-x-2 relative">
                {aiLoadingField === "title" ? (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 transform text-caption text-mutedDark animate-pulse flex items-center gap-1 whitespace-nowrap pr-1">
                    <span>AI is generating</span><span className="text-caption">🤖</span>
                  </span>
                ) : (
                  <button
                    className={`text-mutedDark hover:text-secondary transition-colors ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      setAiLoadingField("title");
                      setTimeout(() => {
                        getRandomVs();
                        setAiLoadingField(null);
                      }, 1000);
                    }}
                    disabled={!isLoggedIn}
                    title="Generate with AI"
                  >
                    ✨
                  </button>
                )}
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
                {aiLoadingField === "title" ? (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-caption text-mutedDark animate-pulse">
                    AI is generating 🤖
                  </span>
                ) : (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-mutedDark hover:text-secondary transition-colors"
                    onClick={() => {
                      setAiLoadingField("title");
                      setTimeout(() => {
                        getRandomVs();
                        setAiLoadingField(null);
                      }, 1000);
                    }}
                    type="button"
                    tabIndex={-1}
                    title="Generate with AI"
                  >
                    ✨
                  </button>
                )}
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
              <label htmlFor="statement-input" className="block text-caption text-mutedDark mb-1">
                Statement
              </label>
              <div className="relative">
                <textarea
                  id="statement-input"
                  placeholder="Why do you think your side is better?"
                  className="w-full bg-bgwhite rounded-3xl text-caption text-secondary border border-muted25 focus:outline-none resize-none px-3 py-2 pr-10"
                  rows="2"
                  value={statement}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  maxLength={200}
                ></textarea>
                {aiLoadingField === "statement" ? (
                  <span className="absolute right-2 top-2 text-caption text-mutedDark animate-pulse">
                    AI is generating 🤖
                  </span>
                ) : (
                  <button
                    className="absolute right-2 top-2 text-mutedDark hover:text-secondary transition-colors"
                    onClick={() => {
                      setAiLoadingField("statement");
                      setTimeout(() => {
                        generateMockStatement();
                        setAiLoadingField(null);
                      }, 1000);
                    }}
                    type="button"
                    tabIndex={-1}
                    title="Generate with AI"
                  >
                    ✨
                  </button>
                )}
              </div>
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
              <div className="relative">
                <input
                  id="tags-input"
                  type="text"
                  placeholder="Add tags separated by comma or Enter"
                  className="w-full bg-bgwhite rounded-3xl text-caption text-secondary border border-muted focus:outline-none px-3 py-2 pr-10"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  maxLength={100}
                />
                {aiLoadingField === "tags" ? (
                  <span className="absolute right-2 top-2 text-xs text-mutedDark animate-pulse">
                    AI is generating 🤖
                  </span>
                ) : (
                  <button
                    className="absolute right-2 top-2 text-mutedDark hover:text-secondary transition-colors"
                    type="button"
                    onClick={() => {
                      setAiLoadingField("tags");
                      setTimeout(() => {
                        setTags([...tags, "fun", "animals"].filter(tag => !tags.includes(tag)));
                        setAiLoadingField(null);
                      }, 1000);
                    }}
                    tabIndex={-1}
                    title="Generate with AI"
                  >
                    ✨
                  </button>
                )}
              </div>
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
            <span>Filter by:</span>
            <span className="font-medium text-secondary">
              {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
            </span>
            <span className="text-xs">▼</span>
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-20 w-36">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange("all")}
              >
              ⚔️ All
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange("hot")}
              >
              🤯 Hot
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange("new")}
              >
               ⚡ New
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-muted25"
                onClick={() => handleSortOptionChange("finished")}
              >
                ⏰ Finished
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clash list */}
      <div className="space-y-6 px-4 bg-bgashwhite">
        {Array.isArray(visibleClashes) && visibleClashes.length > 0 ? (
          visibleClashes.map((clash) => {
            return clash && clash._id ? (
              <div key={clash._id} className="mb-10 pb-6">
                <ClashCard
                  vs_title={clash.vs_title}
                  vs_statement={clash.vs_statement}
                  argument={clash.vs_argument || (clash.clashArguments?.[0]?.text || "")}
                  clashArguments={clash.clashArguments || []}
                  reactions={clash.reactions}
                  tags={clash.tags}
                  expires_at={clash.expires_at}
                  createdAt={clash.createdAt}
                  creator={clash.creator}
                  user={user}
                  onTagClick={handleTagFilter}
                />
              </div>
            ) : null;
          })
        ) : (
          isLoading ? (
            <div className="space-y-6 px-4 bg-bgashwhite">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-48 bg-muted25 rounded-2xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-label text-mutedDark">
              No clashes found. Create the first one!
            </div>
          )
        )}
      </div>

      {/* Clash count info */}
      {filteredClashes.length > 0 && (
        <div className="text-center text-label text-mutedDark py-2">
          Showing {visibleClashes.length} of {filteredClashes.length} clash{filteredClashes.length > 1 ? "es" : ""}
        </div>
      )}

      {/* Loading indicator with enhanced feedback */}
      {(hasMore || allItemsLoaded) && (
        <div 
          ref={loaderRef} 
          className="p-4 text-center text-label text-mutedDark"
        >
          {isLoadingMore ? (
            "Loading more clashes..."
          ) : allItemsLoaded ? (
            "✅ All clashes loaded"
          ) : (
            "Scroll for more"
          )}
        </div>
      )}
      </div>
    </>
  );
};

export default ClashFeed;