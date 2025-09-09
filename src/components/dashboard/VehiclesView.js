import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const VehiclesView = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => ({ ...state.auth }));
  const businessType = user?.result?.businessType || '';
  
  // Placeholder za stvarne podatke o vozilima
  const dummyVehicles = [
    {
      id: 1,
      ownerName: "Marko Petrović",
      make: "Volkswagen",
      model: "Golf 7",
      year: "2018",
      licensePlate: "BG-123-AB",
      lastService: "2023-04-15",
      nextServiceDue: "2023-10-15",
      notes: "Redovni servis na 60.000 km"
    },
    {
      id: 2,
      ownerName: "Ana Jovanović",
      make: "Škoda",
      model: "Octavia",
      year: "2020",
      licensePlate: "NS-456-CD",
      lastService: "2023-03-10",
      nextServiceDue: "2023-09-10",
      notes: "Zamenjen filter ulja i vazduha"
    },
    {
      id: 3,
      ownerName: "Nikola Nikolić",
      make: "Audi",
      model: "A4",
      year: "2019",
      licensePlate: "BG-789-EF",
      lastService: "2023-05-01",
      nextServiceDue: "2023-11-01",
      notes: "Problem sa kočnicama - proveriti pri sledećem servisu"
    }
  ];

  // Funkcije za izračunavanje statusa servisa
  const calculateDaysUntilService = (dateString) => {
    const today = new Date();
    const serviceDate = new Date(dateString);
    const diffTime = serviceDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getServiceStatus = (dateString) => {
    const daysUntil = calculateDaysUntilService(dateString);
    
    if (daysUntil < 0) {
      return {
        text: "Prekoračen rok",
        className: "text-red-600 font-medium"
      };
    } else if (daysUntil <= 30) {
      return {
        text: `Za ${daysUntil} dana`,
        className: "text-yellow-600 font-medium"
      };
    } else {
      return {
        text: `Za ${daysUntil} dana`,
        className: "text-green-600"
      };
    }
  };

  return (
    <div className="vehicles-view">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Vehicle Service Records</h3>
        <button 
          className="bg-primary text-white px-3 py-1 rounded text-sm"
          onClick={() => {}}
        >
          Add Vehicle
        </button>
      </div>
      
      {isLoading ? (
        <p className="text-center py-4">Loading vehicles...</p>
      ) : dummyVehicles.length > 0 ? (
        <div className="overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {dummyVehicles.map((vehicle) => {
              const serviceStatus = getServiceStatus(vehicle.nextServiceDue);
              
              return (
                <div 
                  key={vehicle.id} 
                  className="p-3 mb-2 rounded-md border border-gray-200 bg-gray-50"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                    <span className="text-sm font-medium">{vehicle.ownerName}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      <p className="text-sm">{vehicle.year} | {vehicle.licensePlate}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last service: {vehicle.lastService}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs">Next service:</p>
                      <p className={`text-xs ${serviceStatus.className}`}>
                        {serviceStatus.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-gray-500">No vehicle records available</p>
      )}

      <div className="mt-3 text-right">
        <button 
          className="text-primary text-sm hover:underline"
          onClick={() => {}}
        >
          Schedule Service
        </button>
      </div>
    </div>
  );
};

export default VehiclesView; 