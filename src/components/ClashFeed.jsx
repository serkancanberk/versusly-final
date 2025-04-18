import React from "react";
import ClashCard from "./ClashCard";

const ClashFeed = () => {
  return (
    <div className="w-full sm:w-2/4 border-l border-r border-muted">
      {/* Başlık ve Arama kutusu */}
      <div className="bg-muted25 p-6 sm:p-10 mb-6 relative border-b border-muted bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%2210%22%3E%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%221%22%20fill%3D%22%23E0E2DB%22%20%2F%3E%3C%2Fsvg%3E')]">
        <h2 className="text-subheading text-secondary mb-1 mt-10 sm:mt-16 flex justify-start">
          🔥 Clash Starts Here.
        </h2>
        <p className="text-body text-secondary mb-4 sm:mb-5">
          Your bold statement meets its rival. AI scores both sides. The crowd decides.
        </p>

        <input
          type="text"
          placeholder="Drop your bold idea here"
          className="w-full mb-2 px-4 py-2 text-secondary placeholder-opacity-50 bg-white border-b-2 border-primary shadow-md rounded-lg"
        />
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-primary text-label text-secondary border-b-4 border-primary rounded-lg mt-5 ml-auto hover:shadow-md hover:bg-bgashwhite hover:border-b-4 hover:border-primary hover:bg-opacity-75 w-auto">
            Start A New Clash ⚔️
          </button>
        </div>
      </div>

      {/* Highlighted Clashes Bölümü */}
      <div className="flex items-center justify-between sm:px-10 px-6 py-2">
        <h3 className="text-body text-secondary font-bold">Highlighted Clashes</h3>
        <button className="p-3 bg-muted25 text-secondary rounded-lg border-b-2 text-sm hover:text-secondary hover:bg-bgashwhite hover:border-b-2 hover:border-primary hover:rounded-lg w-auto">
          Sort by 📶
        </button>
      </div>

      {/* Clash Cards */}
      <div className="space-y-6 sm:space-y-10 p-6 sm:p-10">
        <ClashCard />
        <ClashCard />
        <ClashCard />
      </div>
    </div>
  );
};

export default ClashFeed;
