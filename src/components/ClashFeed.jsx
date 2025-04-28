import React, { useState } from "react";
import ClashCard from "./ClashCard";

const ClashFeed = () => {
  // State: input değerini kontrol etmek için
  const [inputValue, setInputValue] = useState("");

  // Input alanı değiştiğinde state'i güncelleyen fonksiyon
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="w-full h-full">
      {/* Başlık ve Arama kutusu */}
      <div className="bg-muted25 p-6 sm:p-10 mb-6 relative border-b border-muted bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%2210%22%3E%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%221%22%20fill%3D%22%23E0E2DB%22%20%2F%3E%3C%2Fsvg%3E')]">
        <h2 className="text-subheading text-secondary mb-2 mt-10 sm:mt-10 flex justify-start">
          🔥 Clash Starts Here.
        </h2>
        <p className="text-body text-secondary mb-4 sm:mb-5">
          Your bold statement meets its rival. AI scores both sides. The crowd decides.
        </p>

        <input
          type="text"
          placeholder="Drop your bold idea here first!"
          className="w-full mb-2 px-4 py-2 text-secondary placeholder-opacity-50 bg-white border-b-2 border-primary shadow-md rounded-lg"
          value={inputValue}  // Input değerini state'ten alıyoruz
          onChange={handleInputChange}  // Input değeri değiştiğinde handleInputChange fonksiyonu çalışacak
        />
        <div className="flex justify-end">
          <button
            className="px-6 py-2 mt-2 bg-primary text-label text-secondary border-b-4 border-primary rounded-lg hover:shadow-md hover:bg-opacity-75 w-auto"
            disabled={!inputValue}  // Input boşsa butonu devre dışı bırakıyoruz
            style={{ opacity: inputValue ? 1 : 0.75 }}  // Eğer input boşsa buton %50 şeffaf olur
          >
            Start A New Clash ⚔️
          </button>
        </div>
      </div>

      {/* Highlighted Clashes Bölümü */}
      <div className="flex items-center justify-between sm:px-10 px-6 py-2">
        <h3 className="text-body text-secondary font-bold">Highlighted Clashes</h3>
        <button className="px-3 py-3 mt-3 bg-muted25 text-label text-secondary rounded-lg hover:shadow-md hover:bg-opacity-75 w-auto">
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
