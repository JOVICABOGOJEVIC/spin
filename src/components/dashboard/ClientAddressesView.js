import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { businessTypeHasFeature } from '../../utils/businessTypeConfig';
import { getBusinessType } from '../../utils/businessTypeUtils';

const ClientAddressesView = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => ({ ...state.auth }));
  const businessType = getBusinessType() || user?.result?.businessType || '';
  
  const isHomeApplianceTechnician = businessType === 'Home Appliance Technician';
  const isAutoMechanic = businessType === 'Auto Mechanic';

  // Placeholder za stvarne podatke o adresama klijenata
  const dummyAddresses = isHomeApplianceTechnician ? [
    {
      id: 1,
      clientName: "Marko Petrović",
      address: "Bulevar Oslobođenja 56",
      city: "Beograd",
      apartmentNumber: "12",
      floor: "3",
      locationDescription: "Zgrada pored pekare, interfon ne radi, pozvati na mobilni.",
      phone: "+381601234567",
      lastVisit: "2023-05-01"
    },
    {
      id: 2,
      clientName: "Ana Jovanović",
      address: "Cara Dušana 14",
      city: "Beograd",
      apartmentNumber: "5A",
      floor: "1",
      locationDescription: "Stara zgrada, lift ne radi.",
      phone: "+381603214567",
      lastVisit: "2023-04-20"
    },
    {
      id: 3,
      clientName: "Nikola Nikolić",
      address: "Knez Mihailova 22",
      city: "Beograd",
      apartmentNumber: "8",
      floor: "2",
      locationDescription: "",
      phone: "+381641234567",
      lastVisit: null
    }
  ] : [
    {
      id: 1,
      clientName: "Marko Petrović",
      address: "Bulevar Oslobođenja 56",
      city: "Beograd",
      phone: "+381601234567",
      lastVisit: "2023-05-01"
    },
    {
      id: 2,
      clientName: "Ana Jovanović",
      address: "Cara Dušana 14",
      city: "Beograd",
      phone: "+381603214567",
      lastVisit: "2023-04-20"
    },
    {
      id: 3,
      clientName: "Nikola Nikolić",
      address: "Knez Mihailova 22",
      city: "Beograd",
      phone: "+381641234567",
      lastVisit: null
    }
  ];

  // Ažuriranje naslova i sadržaja zavisno od tipa biznisa
  const getViewTitle = () => {
    if (isAutoMechanic) {
      return "Lokacije klijenata i garaže";
    } else if (isHomeApplianceTechnician) {
      return "Adrese za terenske posete";
    } else {
      return "Lokacije klijenata";
    }
  };

  const getViewDescription = () => {
    if (isAutoMechanic) {
      return "Prikaz lokacija klijenata i informacije o njihovim vozilima.";
    } else if (isHomeApplianceTechnician) {
      return "Detalji adresa klijenata za terenske posete sa informacijama o stanu i spratu.";
    } else {
      return "Adrese klijenata za posete i servis na terenu.";
    }
  };

  return (
    <div className="client-addresses-view">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{getViewTitle()}</h3>
        <p className="text-sm text-gray-600">{getViewDescription()}</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div></div> {/* Prazan div za flexbox poravnanje */}
        <button 
          className="bg-primary text-white px-3 py-1 rounded text-sm"
          onClick={() => {}}
        >
          Dodaj klijenta
        </button>
      </div>
      
      {isLoading ? (
        <p className="text-center py-4">Učitavanje adresa klijenata...</p>
      ) : dummyAddresses.length > 0 ? (
        <div className="overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {dummyAddresses.map((client) => (
              <div 
                key={client.id} 
                className="p-3 mb-2 rounded-md border border-gray-200 bg-gray-50"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{client.clientName}</span>
                  <span className="text-sm text-gray-600">
                    {client.lastVisit ? `Poslednja poseta: ${client.lastVisit}` : 'Novi klijent'}
                  </span>
                </div>
                <p className="text-sm mt-1">{client.address}, {client.city}</p>
                
                {isHomeApplianceTechnician && (
                  <div className="mt-1 text-xs">
                    {client.apartmentNumber && client.floor && (
                      <p className="text-gray-700">
                        Stan: {client.apartmentNumber}, Sprat: {client.floor}
                      </p>
                    )}
                    {client.locationDescription && (
                      <p className="text-gray-600 italic mt-1">{client.locationDescription}</p>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">{client.phone}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-gray-500">Nema sačuvanih adresa klijenata</p>
      )}

      <div className="mt-3 text-right">
        <button 
          className="text-primary text-sm hover:underline"
          onClick={() => {}}
        >
          Prikaži sve klijente
        </button>
      </div>
    </div>
  );
};

export default ClientAddressesView; 