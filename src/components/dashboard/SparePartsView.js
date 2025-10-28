import React from 'react';
import SparePartList from '../spareParts/SparePartList';

const SparePartsView = () => {
  return (
    <div className="h-full bg-gray-900 p-2 sm:p-4">
      <div className="bg-gray-900">
        <SparePartList />
      </div>
    </div>
  );
};

export default SparePartsView; 