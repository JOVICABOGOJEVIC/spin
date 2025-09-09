import React from 'react';
import SparePartList from '../spareParts/SparePartList';

const SparePartsView = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-[#0f1c47] rounded-lg shadow-sm p-6">
        <SparePartList />
      </div>
    </div>
  );
};

export default SparePartsView; 