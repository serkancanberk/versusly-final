import React, { useState, useEffect } from "react";

export default function ClashCard() {
  const messages = [
    { icon: "⚡", text: "New Clash" },
    { icon: "🤺", text: "No arguments yet – strike the first one." },
    { icon: "🧨", text: "Ticking clash: 12h 23m left" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

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

  return (
    <div className="bg-bgwhite dark:bg-secondary rounded-2xl shadow-md border border-muted dark:border-muted-dark overflow-hidden transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src="https://randomuser.me/api/portraits/women/1.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-body text-secondary">@username_A</span>
            <span className="text-caption text-mutedDark">3h ago</span>
          </div>
        </div>
        <button className="text-xl text-secondary hover:text-mutedDark">⋮</button>
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
          <span className="text-body font-bold">Coffee vs. Tea</span>
        </div>

        {/* Statement ve Argument */}
        <h2 className="text-subheading text-secondary mb-0">Statement</h2>
        <p className="text-body text-secondary mt-1">Argument... more</p>

        {/* Dotted Separator */}
        <div className="border-t border-dotted border-muted my-4" />

        {/* Animasyonlu Mesajlar */}
        <div className="relative h-10">
          <div
            className={`flex items-center space-x-2 absolute transition-opacity duration-500 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="w-8 h-8 rounded-full bg-muted25 flex items-center justify-center">{messages[currentIndex].icon}</span>
            <span className="text-caption text-secondary">{messages[currentIndex].text}</span>
          </div>
        </div>

        {/* Dotted Separator */}
        <div className="border-t border-dotted border-muted my-4" />
      </div>

      {/* Footer Aksiyonları */}
      <div className="flex items-center justify-between p-4 pt-0">
        <button className="flex items-center space-x-1 text-caption text-secondary hover:text-mutedDark">
          <span>👊</span>
          <span>React</span>
        </button>
        <button className="flex items-center space-x-1 text-caption text-secondary hover:text-mutedDark">
          <span>🔗</span>
          <span>Share</span>
        </button>
        <button className="px-4 py-2 bg-primary text-label text-secondary border-b-4 border-primary rounded-lg hover:shadow-md hover:bg-opacity-75">
          💀 Check This
        </button>
      </div>
    </div>
  );
}