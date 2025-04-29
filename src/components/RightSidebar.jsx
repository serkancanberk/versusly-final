import React from "react";

const RightSidebar = () => {
  return (
    <div className="p-4 pl-6 pr-4 flex flex-col h-full">
      {/* Top Combat Arenas */}
      <div className="mt-16 flex-grow">
        <h2 className="text-subheading text-secondary mb-4">🛡️ Find Tough Clashes</h2>
        {/* Arama kutusu */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="What battle are you looking for?"
            className="w-full py-2 px-4 text-sm text-secondary bg-muted25 rounded-md"
          />
          <div className="absolute right-2 top-2 text-secondary">
            🔍
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {/* İlk satır */}
          <button className="px-3 py-3 mt-3 bg-muted25 text-caption text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">Mind Duel</button>
          <button className="px-3 py-3 mt-3 bg-muted25 text-caption text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">Pop Arena</button>
          <button className="px-3 py-3 mt-3 bg-muted25 text-caption text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">Fan Battle</button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {/* İkinci satır */}
          <button className="px-3 py-3 mt-3 bg-muted25 text-caption text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">Taste War</button>
          <button className="px-3 py-3 mt-3 bg-muted25 text-caption text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">Tech Clash</button>
          <button className="px-3 py-3 mt-3 bg-muted25 text-caption text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">Old School</button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Üçüncü satır */}
          <button className="px-3 py-3 mt-3 bg-muted25 text-caption text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">Hype Showdown</button>
          <button className="px-3 py-3 mt-3 bg-muted25 text-caption text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">Wildcard</button>
        </div>
      </div>

      {/* Join the Clash */}
      <div className="mt-auto pt-4">
        <h2 className="text-subheading text-secondary mb-2">🪂 Join the Clash</h2>
        <p className="text-label text-muted-dark mb-4">
          From hot takes to showdowns — pick a side and make it count.
        </p>
        <button className="w-full px-3 py-3 mt-3 mb-2 bg-primary text-label text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">
          Enter With Google
        </button>
        <button className="w-full px-3 py-3 mt-2 mb-2 bg-muted25 text-label text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75">
          Rejoin
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
