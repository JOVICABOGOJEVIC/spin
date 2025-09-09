import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const SparePartAutocomplete = ({ onSelect, value, onChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { items: spareParts } = useSelector((state) => state.spareParts);

  useEffect(() => {
    if (value && value.length > 1) {
      const filteredParts = spareParts.filter(part => 
        part.name.toLowerCase().includes(value.toLowerCase()) ||
        part.code.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredParts);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, spareParts]);

  const handleSelect = (part) => {
    onSelect(part);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-600 rounded px-2 py-1.5 text-xs text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow h-8"
        placeholder="Unesite naziv ili šifru dela..."
      />
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg"
          style={{
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((part) => (
            <div
              key={part._id}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-xs text-white"
              onClick={() => handleSelect(part)}
            >
              <div className="font-medium">{part.name}</div>
              <div className="text-gray-400">
                Šifra: {part.code} | Cena: {part.price} din | Na stanju: {part.quantity}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SparePartAutocomplete; 