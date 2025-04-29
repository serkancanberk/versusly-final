import React, { useState, useEffect, useRef } from "react";
import ClashCard from "./ClashCard";

const ClashFeed = () => {
  // State değişkenleri
  const [inputValue, setInputValue] = useState("");
  const [titleValue, setTitleValue] = useState(""); // VS başlığı için yeni state
  const [supportingArgument, setSupportingArgument] = useState("");
  const [selectedSide, setSelectedSide] = useState("A");
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState([1, 2, 3]); // İlk 3 kartı temsil eden dizi
  const loaderRef = useRef(null);
  
  // Sort by dropdown için state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState("newest"); // default: newest
  const sortMenuRef = useRef(null);

  // Side A ve Side B için dinamik başlıklar
  const [sideATitle, setSideATitle] = useState("Side A");
  const [sideBTitle, setSideBTitle] = useState("Side B");

  // Input alanı değiştiğinde state'i güncelleyen fonksiyon
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
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
    
    // Burada sıralama işlemleri yapılabilir
    console.log(`Sorting by: ${option}`);
    
    // Örnek: "newest" veya "hot" durumuna göre kartları sırala
    // Gerçek uygulamada bu kısımda API çağrısı yapılabilir
    if (option === "newest") {
      // Yeni clash'leri öne getir (örnek)
      // setCards([...]);
    } else if (option === "hot") {
      // Popüler clash'leri öne getir (örnek)
      // setCards([...]);
    }
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

  // "Start A New Clash" butonuna tıklandığında detaylı formu göster
  const handleStartNewClash = () => {
    setShowDetailedForm(true);
    // İlk kez formu açarken başlıkları güncelle
    updateSideTitles(titleValue);
  };

  // Clash'i yayınla
  const handleReleaseClash = () => {
    // Burada backend'e veri gönderme işlemleri yapılacak
    console.log({
      title: titleValue,
      statement: inputValue,
      supportingArgument,
      selectedSide,
      sideATitle,
      sideBTitle
    });
    
    // Formu sıfırla ve kapat
    setTitleValue("");
    setInputValue("");
    setSupportingArgument("");
    setSelectedSide("A");
    setSideATitle("Side A");
    setSideBTitle("Side B");
    setShowDetailedForm(false);
  };

  // Formu temizle ve önceki state'e dön
  const handleClearForm = () => {
    // Tüm değişiklikleri sıfırlayarak ilk forma dön
    setTitleValue("");
    setInputValue("");
    setSupportingArgument("");
    setSelectedSide("A");
    setSideATitle("Side A");
    setSideBTitle("Side B");
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

  // Intersection Observer ile lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading) {
          loadMoreCards();
        }
      },
      {
        root: null,
        rootMargin: "20px",
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
  }, [isLoading, cards]);

  // Daha fazla kart yükleme fonksiyonu
  const loadMoreCards = () => {
    setIsLoading(true);
    
    // Yükleme simülasyonu (gerçek bir API çağrısı ile değiştirilmeli)
    setTimeout(() => {
      // Mevcut kartlar + 2 yeni kart ekle
      setCards((prevCards) => [...prevCards, prevCards.length + 1, prevCards.length + 2]);
      setIsLoading(false);
    }, 1500); // 1.5 saniye gecikme simülasyonu
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
            <input
              type="text"
              placeholder="Drop here the title of your bold VS."
              className="w-full mb-2 px-4 py-2 text-secondary text-label placeholder-opacity-50 bg-white border-b-2 border-primary shadow-md rounded-lg"
              value={titleValue}
              onChange={handleTitleChange}
              onKeyPress={handleKeyPress}
            />
            <div className="flex justify-end">
              <button
                className="px-6 py-2 mt-2 bg-primary text-label text-secondary border-b-4 border-primary rounded-lg hover:shadow-md hover:bg-opacity-75 w-auto"
                disabled={!titleValue}
                style={{ opacity: titleValue ? 1 : 0.75 }}
                onClick={handleStartNewClash}
              >
                Start A New Clash ⚔️
              </button>
            </div>
          </>
        ) : (
          // Detaylı form (butona tıklandıktan sonra) - Yeni tasarım
          <div className="bg-white rounded-lg p-5 shadow-md">
            <div className="space-y-4">
              {/* Title of VS */}
              <div className="flex flex-col">
                <label className="text-label text-secondary mt-3 mb-1 opacity-75">Title of VS</label>
                <div className="relative">
                  <input
                    id="title-vs-input"
                    type="text"
                    placeholder="e.g., Metallica vs. Iron Maiden"
                    className="w-full px-4 py-2 text-secondary text-label border-b border-primary bg-white rounded-md focus:outline-none"
                    value={titleValue}
                    onChange={handleTitleChange}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute right-2 top-2 flex space-x-1">
                    <button className="text-secondary hover:text-primary">✨</button>
                  </div>
                </div>
              </div>
              
              {/* Statement */}
              <div className="flex flex-col">
                <label className="text-label text-secondary mt-3 mb-1 opacity-75">Statement</label>
                <div className="relative">
                  <input
                    id="statement-input"
                    type="text"
                    placeholder="Drop your bold idea here"
                    className="w-full px-4 py-2 text-secondary text-label border-b border-primary bg-white rounded-md focus:outline-none"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute right-2 top-2 flex space-x-1">
                    <button className="text-secondary hover:text-primary">✨</button>
                  </div>
                </div>
              </div>
              
              {/* Argument */}
              <div className="flex flex-col">
                <label className="text-label text-secondary mt-3 mb-1 opacity-75">Supporting Argument</label>
                <div className="relative">
                  <input
                    id="supporting-argument-input"
                    type="text"
                    placeholder="It is optional. Need help? Ask AI to complete it"
                    className="w-full px-4 py-2 text-secondary text-label border-b border-muted bg-white rounded-md focus:outline-none"
                    value={supportingArgument}
                    onChange={handleSupportingArgChange}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute right-2 top-2 flex space-x-1">
                    <button className="text-secondary hover:text-primary">✨</button>
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
                      <button 
                        className="ml-1 text-xs opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSideTitle('A');
                        }}
                      >
                        ✏️
                      </button>
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
                      <button 
                        className="ml-1 text-xs opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSideTitle('B');
                        }}
                      >
                        ✏️
                      </button>
                    </div>
                  </button>
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
                  className="px-3 py-3 bg-primary text-label text-secondary rounded-md hover:bg-opacity-75"
                  onClick={handleReleaseClash}
                  disabled={!titleValue}
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
      <div className="space-y-6 sm:space-y-6 px-6 sm:px-10 pt-2">
        {cards.map((card, index) => (
          <ClashCard key={index} />
        ))}
        
        {/* Loader Bölümü */}
        <div 
          ref={loaderRef} 
          className="py-8 flex justify-center items-center"
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mb-2"></div>
              <p className="text-sm text-secondary mb-4">Loading more clashes...</p>
            </div>
          ) : cards.length >= 9 ? (
            <p className="text-sm text-secondary py-2">You've caught up with all clashes!</p>
          ) : (
            <div className="h-8 opacity-0">Loader placeholder</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClashFeed;
