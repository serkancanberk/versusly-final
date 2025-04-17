// src/components/RightSideBar.jsx
import React from "react";

const RightSidebar = () => {
  return (
    <div className="w-1/4 p-4 flex flex-col justify-between h-screen">
      {/* Arama Inputu */}
      <div className="mb-0 mt-20 flex-1">
        <input
          type="text"
          placeholder="What battle are you looking for? 👀"
          className="w-full py-2 px-4 text-body text-secondary placeholder-opacity-50 bg-white border-b-2 border-primary shadow-md rounded-md"
        />
      </div>

      {/* Top Combat Arenas */}
      <div className="mb-20 mt-0 flex-1">
        <h2 className="text-subheading text-secondary">🛡️ Top Combat Arenas</h2>
        <div className="space-y-2">
    <button className="bg-muted25 text-secondary py-2 px-2 rounded-lg border-b-2 text-sm hover:text-secondary hover:bg-bgashwhite hover:border-b-2 hover:border-primary hover:rounded-lg w-auto">Mind Duel</button>
    <button className="bg-muted25 text-secondary py-2 px-2 rounded-lg border-b-2 text-sm hover:text-secondary hover:bg-bgashwhite hover:border-b-2 hover:border-primary hover:rounded-lg w-auto">Pop Arena</button>
    <button className="bg-muted25 text-secondary py-2 px-2 rounded-lg border-b-2 text-sm hover:text-secondary hover:bg-bgashwhite hover:border-b-2 hover:border-primary hover:rounded-lg w-auto">Fan Battle</button>
    <button className="bg-muted25 text-secondary py-2 px-2 rounded-lg border-b-2 text-sm hover:text-secondary hover:bg-bgashwhite hover:border-b-2 hover:border-primary hover:rounded-lg w-auto">Taste War</button>
    <button className="bg-muted25 text-secondary py-2 px-2 rounded-lg border-b-2 text-sm hover:text-secondary hover:bg-bgashwhite hover:border-b-2 hover:border-primary hover:rounded-lg w-auto">Tech Clash</button>
    <button className="bg-muted25 text-secondary py-2 px-2 rounded-lg border-b-2 text-sm hover:text-secondary hover:bg-bgashwhite hover:border-b-2 hover:border-primary hover:rounded-lg w-auto">Hype Showdown</button>
    <button className="bg-muted25 text-secondary py-2 px-2 rounded-lg border-b-2 text-sm hover:text-secondary hover:bg-bgashwhite hover:border-b-2 hover:border-primary hover:rounded-lg w-auto">Old School</button>
    <button className="bg-muted25 text-secondary py-2 px-2 rounded-lg border-b-2 text-sm hover:text-secondary hover:bg-bgashwhite hover:border-b-2 hover:border-primary hover:rounded-lg w-auto">Wildcard</button>
  </div>
      </div>

      {/* Join the Clash */}
      <div className="flex-1">
        <h2 className="text-subheading text-secondary">🪂 Join the Clash</h2>
        <p className="text-body text-muted-dark mt-2">
          From hot takes to showdowns — pick a side and make it count.
        </p>
        <button className="w-full px-6 py-2 bg-primary text-label text-secondary border-b-4 border-primary rounded-lg mt-5 ml-auto hover:shadow-md hover:bg-bgashwhite hover:border-b-4 hover:border-primary hover: rounded-lg hover:bg-opacity-75 w-auto">
          Sign Up With Google
        </button>
        <button className="w-full py-2 mt-4 bg-muted25 text-label border border-muted border-b-4 rounded-lg text-secondary hover:shadow-md hover:bg-bgashwhite hover:border-b-4 hover:border-primary hover:rounded-lg hover:bg-opacity-75 w-auto">
          Rejoin
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
