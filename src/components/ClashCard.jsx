import React from "react";

export default function ClashCard() {
  return (
    <div className="bg-bgwhite dark:bg-secondary rounded-2xl shadow-md p-5 flex flex-col gap-4 border border-muted dark:border-muted-dark transition-colors duration-300">
{/* Üst bölüm: Profile Pic, Kullanıcı adı ve saat */}
<div className="flex items-center justify-between mb-0">
  <div className="flex items-center">
    <img
      src="https://randomuser.me/api/portraits/women/1.jpg"
      alt="Profile"
      className="w-10 h-10 rounded-full object-cover"
    />
    <div className="ml-3">
      <span className="text-body text-secondary">username_A</span>
      <div className="text-caption text-mutedDark">3h ago</div>
    </div>
  </div>

  {/* Sağdaki yazılar ve menü */}
  <div className="flex items-center">
    <div className="flex flex-col text-right ml-2">
      <div className="text-body text-secondary mb-1">
        <span>Coffee ⚔️ Tea</span>
      </div>
      <div className="text-caption text-alert">
        🧨 Ticking clash: 12h 23m left
      </div>
    </div>
    {/* Menü butonu sağda */}
    {/* <button className="text-xl text-muted-dark hover:text-primary ml-5">...</button> */} 
  </div>
</div>
      {/* Ana görsel */}
      <div className="w-full h-60 bg-muted25 dark:bg-zinc-800 flex items-center justify-center rounded-md overflow-hidden mb-0">
        <img
          src="/images/clash_card_final_design.png"
          alt="Clash Visual"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Info Ticker Bantı */}
      <div className="bg-muted25 py-2 rounded-md mb-1 pl-2">
  <span className="text-label">⚡ New × This clash is waiting for new challengers. Become the first one!</span>
</div>

      {/* Statement ve Argument */}
      <h2 className="text-subheading text-secondary mb-0 pl-2">Statement</h2>
      <p className="text-body text-secondary mb-4 pl-2">Argument... more</p>

      {/* Düz çizgi */}
      <hr className="border-t-1 border-muted mb-1" />

      {/* Footer */}
      <div className="flex items-center justify-between mb-2">
        {/* Sağ taraf */}
        <div className="text-caption text-muted-dark space-x-6 pl-2">
          <span>👍 Like (X)</span>
          <span>💬 Arguments (X)</span>
          <span>🔗 Copy Link</span>
        </div>
        {/* Sol taraf */}
        <button className="px-6 py-2 bg-primary text-label text-secondary border-b-4 border-primary rounded-lg mt-5 ml-auto hover:shadow-md hover:bg-bgashwhite hover:border-b-4 hover:border-primary hover: rounded-lg hover:bg-opacity-75 w-auto">
          Check This
        </button>
      </div>
    </div>
  );
}
