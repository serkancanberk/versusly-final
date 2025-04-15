// src/components/ClashFeed.jsx
import React from 'react';
import ClashCard from './ClashCard';

const ClashFeed = () => {
  return (
    <div className="w-[760px] p-4">

<div className="bg-muted25 p-6 mb-8 relative">
  <h2 className="text-subheading text-secondary mb-1" style={{ marginTop: '80px', display: 'flex', justifyContent: 'flex-start' }}>
    🔥 Clash Starts Here.
  </h2>
  <p className="text-body text-secondary mb-5">
    Your bold statement meets its rival. AI scores both sides. The crowd decides.
  </p>
  
  <input 
    type="text" 
    placeholder="Drop your bold idea here"
    className="w-full mb-2 px-4 py-2 text-secondary placeholder-opacity-50 bg-white border-b-2 border-primary shadow-md rounded-lg"
  />
  <div className="flex justify-end">
 <button className="w-[187px] h-[40px] bg-primary text-label text-secondary rounded-md mt-5 ml-auto">
  Start A New Clash ⚔️
</button>
</div>
</div>
      <hr className="w-full border-t-1 border-muted mt-5" />

      <div className="flex items-center justify-between mb-6 mt-6">
        <h3 className="text-body text-secondary">Highlighted Clashes</h3>
        <button className="text-primary hover:underline">Sort by 📶</button>
      </div>


      
      {/* Clash Starts Here */}
      <div className="space-y-4">
        {/* Clash Cards */}
        <ClashCard />
        <ClashCard />
        <ClashCard />
        {/* Daha fazla ClashCard ekleyebilirsiniz */}
      </div>
    </div>
  );
};

export default ClashFeed;
