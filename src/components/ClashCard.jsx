import React from "react";

export default function ClashCard() {
  return (
    <div className="bg-bgwhite dark:bg-secondary rounded-2xl shadow-md p-5 flex flex-col gap-4 border border-muted dark:border-muted-dark transition-colors duration-300">
      
      {/* Üst bölüm: Kategori + süre */}
      <div className="flex items-center justify-between text-label text-muted-dark uppercase tracking-wide">
        <span>🏀 Fan Battle</span>
        <span>🧨 12h 23m left</span>
      </div>

      {/* Ana görsel */}
      <div className="w-full h-44 bg-muted-25 dark:bg-zinc-800 flex items-center justify-center rounded-lg overflow-hidden">
        <img
          src="/images/clash_card_final_design.png"
          alt="Clash Visual"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Başlık */}
      <h2 className="text-heading text-secondary dark:text-bgwhite leading-snug font-bold">
        Magic Johnson ⚔️ LeBron James
      </h2>

      {/* Açıklama */}
      <p className="text-body text-muted-dark leading-relaxed">
        Magic sadece 10 yılda LeBron’un 20 yılda başardıklarından daha fazlasını yaptı...
      </p>

      {/* Alt alan: puan ve aksiyon */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-caption text-muted-dark">
          🧠 AI Score: <span className="font-semibold text-ui-number text-black dark:text-bgwhite">8.9 / 10</span>
        </div>
        <button className="text-label text-accent hover:underline font-medium">
          Join the Clash →
        </button>
      </div>
    </div>
  );
}
