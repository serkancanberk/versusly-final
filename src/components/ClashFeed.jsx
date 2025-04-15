// src/components/ClashFeed.jsx
import React from 'react';
import ClashCard from './ClashCard';

const ClashFeed = () => {
  return (
    <div className="w-[760px] p-4">

<div className="bg-muted25 p-6 mb-8 relative">
  <h2 className="text-subheading text-secondary mb-5" style={{ marginTop: '80px', display: 'flex', justifyContent: 'flex-start' }}>
    🔥 Clash Starts Here.
  </h2>
  <p className="text-body text-secondary mb-5">
    Your bold statement meets its rival. AI scores both sides. The crowd decides.
  </p>
  
  <input 
    type="text" 
    placeholder="Drop your bold idea here"
    className="w-full max-w-[636px] mb-2 px-4 py-2 text-secondary placeholder-opacity-50 bg-white border-b-2 border-primary shadow-md rounded-lg"
  />
  <button className="w-[187px] h-[40px] bg-primary text-secondary rounded-md mt-5">
    Start A New Clash ⚔️
  </button>
</div>
      <hr className="w-full max-w-[760px] border-t-1 border-muted mt-5" />
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
