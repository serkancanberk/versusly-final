// src/components/RightSidebar.jsx
import React from 'react';

const RightSidebar = () => {
  return (
    <div className="w-1/4 bg-zinc-100 dark:bg-zinc-800 p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary">⚡ Top Combat Arenas</h2>
        <ul className="space-y-2 mt-4">
          <li><a href="#" className="text-sm text-secondary hover:text-primary">Mind Duel</a></li>
          <li><a href="#" className="text-sm text-secondary hover:text-primary">Pop Arena</a></li>
          <li><a href="#" className="text-sm text-secondary hover:text-primary">Fan Battle</a></li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-bold text-primary">⚡ Join the Clash</h2>
        <button className="w-full py-2 mt-4 bg-primary text-bgwhite rounded-md">Enter With Google</button>
        <button className="w-full py-2 mt-4 border border-muted rounded-md">Rejoin</button>
      </div>
    </div>
  );
};

export default RightSidebar;
