// src/components/ClashFeed.jsx
import React from 'react';
import ClashCard from './ClashCard';

const ClashFeed = () => {
  return (
    <div className="w-2/4 border-l border-r border-muted">

<div className="bg-muted25 p-10 mb-8 relative border-b border-muted bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%2210%22%3E%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%221%22%20fill%3D%22%23E0E2DB%22%20%2F%3E%3C%2Fsvg%3E')]">
  <h2 className="text-subheading text-secondary mb-1 mt-16" style={{ display: 'flex', justifyContent: 'flex-start' }}>
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
  <button className="px-6 py-2 bg-primary text-label text-secondary border-b-4 border-primary rounded-lg mt-5 ml-auto hover:shadow-md hover:bg-bgashwhite hover:border-b-4 hover:border-primary hover: rounded-lg hover:bg-opacity-75 w-auto">
  Start A New Clash ⚔️
</button>
</div>
</div>
      <div className="flex items-center justify-between mb-1 mt-1">
        <h3 className="text-body font-bold text-secondary px-12">Highlighted Clashes</h3>
        <button className="text-label text-secondary hover:text-mutedDark px-12">Sort by 📶</button>
      </div>
      {/* Clash Starts Here */}
      <div className="space-y-10  p-10">
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
