import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { businessTypeHasFeature } from '../../utils/businessTypeConfig';

const ModelsView = () => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Koristimo useMemo kako bismo sprečili kreiranje novog objekta pri svakom renderovanju
  const user = useSelector((state) => state.auth.user);
  const businessType = useMemo(() => user?.result?.businessType || '', [user?.result?.businessType]);
  
  // Determine what kind of models to display based on business type
  const modelType = useMemo(() => {
    if (businessType === "Home Appliance Technician") return "appliance";
    if (businessType === "Auto Mechanic") return "vehicle";
    if (businessType === "IT Technician") return "device";
    if (businessType === "HVAC Technician") return "system";
    if (businessType === "Elevator Technician") return "elevator";
    return "model";
  }, [businessType]);
  
  // Different dummy data based on business type
  const dummyModels = useMemo(() => {
    if (modelType === "appliance") {
      return [
        {
          id: 1,
          brand: "Gorenje",
          name: "RK6192",
          type: "Frižider",
          parts: ["Kompresor K7600", "Ventil V120", "Termostat T500"],
          notes: "Čest problem sa termostatom"
        },
        {
          id: 2,
          brand: "Bosch",
          name: "WAT28661ME",
          type: "Veš mašina",
          parts: ["Pumpa P450", "Grejač G300", "Programator P200"],
          notes: "Servisiranje na 2 godine"
        },
        {
          id: 3,
          brand: "Samsung",
          name: "RB34",
          type: "Frižider",
          parts: ["Kompresor K8000", "Ventil V220", "Senzor S150"],
          notes: "Novi model, manje kvarova"
        }
      ];
    } else if (modelType === "vehicle") {
      return [
        {
          id: 1,
          brand: "Volkswagen",
          name: "Golf 7",
          type: "Automobil",
          parts: ["Filter ulja", "Filter goriva", "Filter vazduha"],
          notes: "Servis na 15.000 km"
        },
        {
          id: 2,
          brand: "Toyota",
          name: "Corolla",
          type: "Automobil",
          parts: ["Kočioni diskovi", "Ulje", "Svećice"],
          notes: "Pouzdani model"
        }
      ];
    } else if (modelType === "device") {
      return [
        {
          id: 1,
          brand: "Dell",
          name: "XPS 15",
          type: "Laptop",
          parts: ["Baterija", "SSD", "Ventilator"],
          notes: "Čest problem sa pregrevanjem"
        },
        {
          id: 2,
          brand: "HP",
          name: "ProDesk 600",
          type: "Desktop",
          parts: ["RAM", "HDD", "Napajanje"],
          notes: "Pouzdan kancelarijski računar"
        }
      ];
    } else {
      return [
        {
          id: 1,
          brand: "Generic",
          name: "Model A",
          type: "Basic",
          parts: ["Part 1", "Part 2", "Part 3"],
          notes: "Standard model"
        }
      ];
    }
  }, [modelType]);
  
  // Get appropriate title based on model type
  const title = useMemo(() => {
    const titles = {
      appliance: "Appliance Models",
      vehicle: "Vehicle Models",
      device: "Device Models",
      system: "HVAC Systems",
      elevator: "Elevator Models",
      model: "Models Database"
    };
    return titles[modelType] || "Models";
  }, [modelType]);
  
  return (
    <div className="models-view">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button 
          className="bg-primary text-white px-3 py-1 rounded text-sm"
          onClick={() => {}}
        >
          Add Model
        </button>
      </div>
      
      {isLoading ? (
        <p className="text-center py-4">Loading models...</p>
      ) : dummyModels.length > 0 ? (
        <div className="overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {dummyModels.map((model) => (
              <div 
                key={model.id} 
                className="p-3 mb-2 rounded-md border border-gray-200 bg-gray-50"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{model.brand} {model.name}</span>
                  <span className="text-sm text-gray-600">{model.type}</span>
                </div>
                <div className="mt-1">
                  <p className="text-xs text-gray-500">
                    Common parts: {model.parts.join(", ")}
                  </p>
                  {model.notes && (
                    <p className="text-xs text-gray-600 mt-1 italic">{model.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-gray-500">No models in database</p>
      )}

      <div className="mt-3 text-right">
        <button 
          className="text-primary text-sm hover:underline"
          onClick={() => {}}
        >
          View All Models
        </button>
      </div>
    </div>
  );
};

export default ModelsView; 