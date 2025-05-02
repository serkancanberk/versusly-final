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
      // Request creator population (username, profileImage) from the backend
      const res = await fetch(
        `http://localhost:8080/api/clashes?sort=${sortOption === 'hot' ? '-hotScore' : '-createdAt'}&limit=5&offset=${offsetRef.current}${tagParam}`
      );
      const data = await res.json();
      console.log("Fetched Clashes:", JSON.stringify(data, null, 2)); // for clarity
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setClashList(prev => [...prev, ...data]);
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

  // Dropdown menu dışına tıklandığında kapanması için
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortMenuRef]);

  // Re-fetch clashes when selectedTag changes
  useEffect(() => {
    setClashList([]);
    setHasMore(true);
    offsetRef.current = 0;
    fetchClashes();
  }, [selectedTag]);

  // "Start A New Clash" butonuna tıklandığında detaylı formu göster
  const handleStartNewClash = () => {
    if (!user) {
      alert("Lütfen önce giriş yapın.");
      return;
    }
    setShowDetailedForm(true);
    // İlk kez formu açarken başlıkları güncelle
    updateSideTitles(titleValue);
  };

  // Clash'i yayınla
  const handleReleaseClash = async () => {
    if (!user) {
      alert("Lütfen önce giriş yapın.");
      return;
    }
    // Ensure any tag currently typed but not submitted is included
    const finalTags = tagInput.trim()
      ? Array.from(new Set([...tags, tagInput.trim()]))
      : tags;
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const newClash = {
      vs_title: titleValue,
      vs_statement: statement,
      vs_argument: supportingArgument,
      creator: user?._id || mockUserId,
      status: "active",
      duration: 24,
      expires_at,
      tags: finalTags
    };

    console.log("Tag input value:", tagInput);
    console.log("Existing tags array:", tags);
    console.log("Final tags:", finalTags);
    console.log("Full newClash payload being sent:", JSON.stringify(newClash, null, 2));
    console.log("Submitting Clash:", newClash);

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:8080/api/clashes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(newClash)
      });

      if (response.ok) {
        const created = await response.json();
        console.log("Created clash from backend response:", created);
        // Yeni clash'i en üste ekle
        setClashList(prev => [created, ...prev]);
        // Formu sıfırla
        setTitleValue("");
        setStatement("");
        setSupportingArgument("");
        setSelectedSide("A");
        setSideATitle("Side A");
        setSideBTitle("Side B");
        setTags([]);
        setTagInput("");
        setShowDetailedForm(false);
      } else {
        const errorText = await response.text();
        console.error("Failed to create clash:", errorText);
      }
    } catch (err) {
      console.error("Error creating clash:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Formu temizle ve önceki state'e dön
  const handleClearForm = () => {
    // Tüm değişiklikleri sıfırlayarak ilk forma dön
    setTitleValue("");
    setStatement("");
    setSupportingArgument("");
    setSelectedSide("A");
    setSideATitle("Side A");
    setSideBTitle("Side B");
    setTags([]);
    setTagInput("");
    setShowDetailedForm(false);
  };

  // Side A / Side B başlıklarını manuel olarak düzenleme
  const handleEditSideTitle = (side, event) => {
    const newTitle = prompt(`Enter new title for ${side === 'A' ? sideATitle : sideBTitle}:`, 
                           side === 'A' ? sideATitle : sideBTitle);
    if (newTitle && newTitle.trim() !== '') {
      if (side === 'A') {
        setSideATitle(newTitle.trim());
      } else {
        setSideBTitle(newTitle.trim());
      }
    }
  };


  // Generate a mock bold statement based on the title
  const generateMockStatement = () => {
    const title = titleValue.toLowerCase();
    if (title.includes("cats") && title.includes("dogs")) {
      setStatement("Cats would totally win a presidential election.");
    } else if (title.includes("netflix") && title.includes("youtube")) {
      setStatement("Netflix has better storytelling than YouTube ever will.");
    } else {
      const examples = [
        "This side has the upper hand, no doubt.",
        "Clearly a winner here.",
        "Unpopular opinion — but true."
      ];
      const randomIndex = Math.floor(Math.random() * examples.length);
      setStatement(examples[randomIndex]);
    }
  };

  return (
    <div className="w-full h-full">
      {/* Başlık ve Clash yaratma alanı */}
      <div className="bg-muted25 p-6 sm:p-10 mb-6 relative border-b border-muted bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%2210%22%3E%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%221%22%20fill%3D%22%23E0E2DB%22%20%2F%3E%3C%2Fsvg%3E')]">
        <h2 className="text-subheading text-secondary mb-2 mt-10 sm:mt-10 flex justify-start">
          🔥 Clash Starts Here.
        </h2>
        <p className="text-label text-secondary mb-4 sm:mb-5">
          Your bold statement meets its rival. AI scores both sides. The crowd decides.
        </p>

        {!showDetailedForm ? (
          // Basit form (ilk görünen)
          <>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="What's your VS? Let's start with your own or get help from AI!"
                className="w-full mb-2 px-4 py-2 text-secondary text-label placeholder-opacity-50 bg-white border-b-2 border-primary shadow-md rounded-lg"
                value={titleValue}
                onChange={handleTitleChange}
                onKeyPress={handleKeyPress}
              />
              <div className="absolute right-3 top-0 h-full flex items-center">
                <div className="relative group">
                  <button
                    className="w-8 h-8 bg-muted25 text-secondary text-caption rounded-full flex items-center justify-center"
                    onClick={user ? getRandomVs : undefined}
                    disabled={!user}
                  >
                    ✨
                  </button>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-secondary text-white text-caption px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    {user ? "Get Help From AI" : "Sign in to start!"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="relative group inline-block">
                <button
                  className="px-6 py-2 mt-2 bg-primary text-label text-secondary border-b-4 border-primary rounded-lg hover:shadow-md hover:bg-opacity-75 w-auto"
                  disabled={!titleValue || !user}
                  style={{ opacity: titleValue && user ? 1 : 0.5 }}
                  onClick={handleStartNewClash}
                >
                  Start A New Clash ⚔️
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-secondary text-white text-caption px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  {!user ? "Sign in to start!" : ""}
                </div>
              </div>
            </div>
          </>
        ) : (
          // Detaylı form (butona tıklandıktan sonra) - Yeni tasarım
          <div className="bg-white rounded-lg p-5 shadow-md">
            <div className="space-y-3 sm:space-y-4">
              {/* Title of VS */}
              <div className="flex flex-col">
                <label className="text-label text-secondary mt-3 mb-1 opacity-75">Title of VS</label>
                <div className="relative">
                  <input
                    id="title-vs-input"
                    type="text"
                    placeholder="e.g., Metallica vs. Iron Maiden"
                    className="w-full px-4 py-2 text-secondary text-sm sm:text-label border-b border-primary bg-white rounded-md focus:outline-none"
                    value={titleValue}
                    onChange={handleTitleChange}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <div className="relative group">
                      <button
                        className="w-8 h-8 bg-muted25 text-secondary text-caption rounded-full flex items-center justify-center"
                        onClick={getRandomVs}
                      >
                        ✨
                      </button>
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-secondary text-white text-caption px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        Get Help From AI
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Choose Your Side - İçerikle güncellenmiş başlıklar */}
              <div>
                <label className="text-label text-secondary mt-3 mb-3 opacity-75">Choose Your Side</label>
                <div className="flex space-x-3">
                  <button
                    className={`flex-1 py-1 px-2 rounded-md text-center transition ${
                      selectedSide === 'A' 
                        ? 'bg-primary text-secondary text-body' 
                        : 'bg-muted25 text-secondary text-label'
                    }`}
                    onClick={() => handleSideChange('A')}
                  >
                    <div className="flex items-center justify-center">
                      <span>{sideATitle}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="ml-1 text-xs opacity-50 hover:opacity-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSideTitle('A');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                            handleEditSideTitle('A');
                          }
                        }}
                      >
                        ✏️
                      </span>
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-1 px-2 rounded-md text-center transition ${
                      selectedSide === 'B' 
                        ? 'bg-primary text-secondary text-body' 
                        : 'bg-muted25 text-secondary text-label'
                    }`}
                    onClick={() => handleSideChange('B')}
                  >
                    <div className="flex items-center justify-center">
                      <span>{sideBTitle}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="ml-1 text-xs opacity-50 hover:opacity-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSideTitle('B');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                            handleEditSideTitle('B');
                          }
                        }}
                      >
                        ✏️
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Statement */}
              <div className="flex flex-col">
                <label className="text-label text-secondary mt-3 mb-1 opacity-75">Your Bold Statement</label>
                <div className="relative">
                  <input
                    id="statement-input"
                    type="text"
                    placeholder="Drop your bold idea here"
                    className="w-full px-4 py-2 text-secondary text-sm sm:text-label border-b border-primary bg-white rounded-md focus:outline-none"
                    value={statement}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <div className="relative group">
                      <button
                        className="w-8 h-8 bg-muted25 text-secondary text-caption rounded-full flex items-center justify-center"
                        onClick={generateMockStatement}
                      >
                        ✨
                      </button>
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-secondary text-white text-caption px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        Get Help From AI
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/*
              Argument
              <div className="flex flex-col">
                <label className="text-label text-secondary mt-3 mb-1 opacity-75">Supporting Argument</label>
                <div className="relative">
                  <input
                    id="supporting-argument-input"
                    type="text"
                    placeholder="It is optional. Need help? Get Help From AI to complete it"
                    className="w-full px-4 py-2 text-secondary text-sm sm:text-label border-b border-muted bg-white rounded-md focus:outline-none"
                    value={supportingArgument}
                    onChange={handleSupportingArgChange}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <button
                      className="group flex items-center overflow-hidden whitespace-nowrap bg-muted25 text-secondary text-caption rounded-full w-8 hover:w-36 transition-all duration-300 ease-in-out pl-2 pr-0.5 py-1"
                      title="Suggest a supporting argument"
                    >
                      <span className="mr-1">✨</span>
                      <span className="text-label opacity-0 group-hover:opacity-75 transition-opacity duration-200">Get Help From AI</span>
                    </button>
                  </div>
                </div>
              </div>
              */}

              {/* Tags Input */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mt-3 mb-1">
                  <label className="text-label text-secondary opacity-75">Tags (Press Enter or , to add)</label>
                </div>
                <div className="flex flex-wrap items-center border-b border-muted bg-white px-3 py-2 rounded-md">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary text-secondary text-caption px-2 py-1 mr-2 mb-2 rounded-full flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 text-xs opacity-75 hover:opacity-100"
                      >
                        ❌
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="flex-grow px-2 py-1 text-secondary placeholder:text-label bg-transparent focus:outline-none"
                    placeholder="e.g., Tech, Politics"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                  />
                  <div className="relative group ml-2">
                    <button
                      className="w-8 h-8 bg-muted25 text-secondary text-caption rounded-full flex items-center justify-center"
                      onClick={async () => {
                        if (!titleValue.trim()) return;
                        try {
                          const res = await fetch('http://localhost:8080/api/clashes/suggest-tags', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: titleValue.trim() })
                          });
                          const data = await res.json();
                          if (typeof data.tags === 'string') {
                            try {
                              const parsedTags = JSON.parse(data.tags);
                              if (Array.isArray(parsedTags)) {
                                setTags(parsedTags);
                              }
                            } catch (jsonErr) {
                              console.error("Failed to parse tag string as JSON array", jsonErr);
                            }
                          } else if (Array.isArray(data.tags)) {
                            setTags(data.tags);
                          }
                        } catch (err) {
                          console.error("Failed to fetch suggested tags:", err);
                        }
                      }}
                    >
                      ✨
                    </button>
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-secondary text-white text-caption px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      Get Help From AI
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between items-center pt-3">
                <button
                  className="flex items-center px-4 py-2 text-label text-secondary hover:bg-muted25 rounded opacity-75"
                  onClick={handleClearForm}
                >
                  🗑️ Clear
                </button>
                <button
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-primary text-sm sm:text-label text-secondary rounded-md hover:bg-opacity-75"
                  onClick={handleReleaseClash}
                  disabled={!user || !titleValue.trim() || !statement.trim()}
                  style={{ opacity: user && titleValue.trim() && statement.trim() ? 1 : 0.5 }}
                  title={!user ? "Lütfen giriş yapın" : ""}
                >
                  Release This Clash ⚔️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Highlighted Clashes Bölümü */}
      <div className="flex items-center justify-between sm:px-10 px-6 py-1 mb-1">
        <h3 className="text-body text-secondary font-bold">Highlighted Clashes</h3>
        
        {/* Sort By Dropdown */}
        <div className="relative" ref={sortMenuRef}>
          <button 
            className="px-3 py-2 bg-muted25 text-label text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75 w-auto flex items-center"
            onClick={toggleSortDropdown}
          >
            <span>Sort by</span>
            <span className="ml-1">{sortOption === "newest" ? "⚡" : "💥"}</span>
          </button>
          
          {/* Dropdown Menu */}
          {showSortDropdown && (
            <div className="absolute right-0 mt-1 py-2 w-48 bg-white rounded-md shadow-lg z-20">
              <button 
                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-muted25 ${sortOption === "newest" ? "text-mutedDark" : "text-secondary"}`}
                onClick={() => handleSortOptionChange("newest")}
              >
                <span className="mr-2">⚡</span>
                <span>New Clashes first</span>
              </button>
              <button 
                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-muted25 ${sortOption === "hot" ? "text-mutedDark" : "text-secondary"}`}
                onClick={() => handleSortOptionChange("hot")}
              >
                <span className="mr-2">💥</span>
                <span>Hot Clashes first</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clash Cards */}
      <div className="space-y-4 sm:space-y-6 px-6 sm:px-10 pt-2">
        {clashList.map((clash, index) => {
          // Debug: ensure tags are present and not undefined
          console.log("ClashCard tags prop:", clash.tags);
          return (
            <ClashCard
              key={`${clash._id}-${index}`}
              title={clash.vs_title}
              statement={clash.vs_statement}
              argument={clash.vs_argument}
              argumentCount={clash.arguments?.length || 0}
              reactions={clash.reactions}
              expires_at={clash.expires_at}
              tags={clash.tags}
              createdAt={clash.createdAt || clash.created_at}
              username={clash.creator?.username || "@username_A"}
              userImage={clash.creator?.profileImage || "https://randomuser.me/api/portraits/women/1.jpg"}
            />
          );
        })}
        
        {/* Loader Bölümü */}
        <div 
          ref={loaderRef} 
          className="py-8 flex justify-center items-center"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm text-secondary py-2">Clashes are loading...</p>
            </div>
          ) : clashList.length === 0 ? (
            <p className="text-sm text-secondary py-2">No clashes yet. Be the first to start one!</p>
          ) : !hasMore ? (
            <p className="text-sm text-secondary py-2">You've caught up with all clashes!</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ClashFeed;
