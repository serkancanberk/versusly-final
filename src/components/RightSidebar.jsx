// src/components/RightSideBar.jsx
import React from "react";

const RightSidebar = () => {
  return (
    <div className="w-1/4 p-4">
      {/* Arama Inputu */}
      <div className="mb-8 mt-20">
        <input
          type="text"
          placeholder="What battle are you looking for? 👀"
          className="w-full py-2 px-4 text-body text-secondary placeholder-opacity-50 bg-white border-b-2 border-primary shadow-md rounded-md"
        />
      </div>

      {/* Top Combat Arenas */}
      <div className="mb-8 mt-10">
        <h2 className="text-subheading text-secondary">🛡️ Top Combat Arenas</h2>
        <div className="space-y-2">
    <button className="bg-muted25 text-secondary py-1 px-3 rounded-lg text-sm hover:text-secondary hover:bg-primary">Mind Duel</button>
    <button className="bg-muted25 text-secondary py-1 px-3 rounded-lg text-sm hover:text-secondary hover:bg-primary">Pop Arena</button>
    <button className="bg-muted25 text-secondary py-1 px-3 rounded-lg text-sm hover:text-secondary hover:bg-primary">Fan Battle</button>
    <button className="bg-muted25 text-secondary py-1 px-3 rounded-lg text-sm hover:text-secondary hover:bg-primary">Taste War</button>
    <button className="bg-muted25 text-secondary py-1 px-3 rounded-lg text-sm hover:text-secondary hover:bg-primary">Tech Clash</button>
    <button className="bg-muted25 text-secondary py-1 px-3 rounded-lg text-sm hover:text-secondary hover:bg-primary">Hype Showdown</button>
    <button className="bg-muted25 text-secondary py-1 px-3 rounded-lg text-sm hover:text-secondary hover:bg-primary">Old School</button>
    <button className="bg-muted25 text-secondary py-1 px-3 rounded-lg text-sm hover:text-secondary hover:bg-primary">Wildcard</button>
  </div>
      </div>

      {/* Join the Clash */}
      <div>
        <h2 className="text-subheading text-secondary">🪂 Join the Clash</h2>
        <p className="text-body text-muted-dark mt-2">
          From hot takes to showdowns — pick a side and make it count.
        </p>
        <button className="w-full py-2 mt-4 bg-primary text-secondary rounded-md">
          Enter With Google
        </button>
        <button className="w-full py-2 mt-4 border border-muted rounded-md border-muted-dark text-mutedDark">
          Rejoin
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
