import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { businessTypeHasFeature } from '../../utils/businessTypeConfig';
import { getBusinessType } from '../../utils/businessTypeUtils';

const AppointmentsView = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => ({ ...state.auth }));
  const businessType = getBusinessType() || user?.result?.businessType || '';
  
  const hasOnSiteService = businessTypeHasFeature(businessType, 'hasOnSiteService');
  const isHomeApplianceTechnician = businessType === 'Home Appliance Technician';

  // Placeholder za stvarne podatke o terminima
  const dummyAppointments = isHomeApplianceTechnician ? [
    {
      id: 1,
      clientName: "Marko Petrović",
      date: "2023-05-12",
      time: "10:00",
      service: "Popravka frižidera",
      address: "Bulevar Oslobođenja 56, Beograd",
      apartmentNumber: "12",
      floor: "3",
      locationDescription: "Zgrada pored pekare, interfon ne radi, pozvati na mobilni.",
      status: "scheduled"
    },
    {
      id: 2,
      clientName: "Ana Jovanović",
      date: "2023-05-13",
      time: "14:30",
      service: "Instalacija veš mašine",
      address: "Cara Dušana 14, Beograd",
      apartmentNumber: "5A",
      floor: "1",
      locationDescription: "Stara zgrada, lift ne radi.",
      status: "completed"
    }
  ] : [
    {
      id: 1,
      clientName: "Marko Petrović",
      date: "2023-05-12",
      time: "10:00",
      service: "Popravka frižidera",
      address: hasOnSiteService ? "Bulevar Oslobođenja 56, Beograd" : null,
      status: "scheduled"
    },
    {
      id: 2,
      clientName: "Ana Jovanović",
      date: "2023-05-13",
      time: "14:30",
      service: "Instalacija veš mašine",
      address: hasOnSiteService ? "Cara Dušana 14, Beograd" : null,
      status: "completed"
    }
  ];

  return (
    <div className="appointments-view">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
        <button 
          className="bg-primary text-white px-3 py-1 rounded text-sm"
          onClick={() => {}}
        >
          New Appointment
        </button>
      </div>
      
      {isLoading ? (
        <p className="text-center py-4">Loading appointments...</p>
      ) : dummyAppointments.length > 0 ? (
        <div className="overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {dummyAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="p-3 mb-2 rounded-md border border-gray-200 bg-gray-50"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{appointment.service}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appointment.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {appointment.status === 'completed' ? 'Completed' : 'Scheduled'}
                  </span>
                </div>
                <p className="text-sm mt-1">
                  <span className="font-medium">{appointment.date}</span> at <span className="font-medium">{appointment.time}</span>
                </p>
                <p className="text-sm text-gray-700 mt-1">{appointment.clientName}</p>
                
                {appointment.address && (
                  <div className="text-xs text-gray-600 mt-1">
                    <div>{appointment.address}</div>
                    
                    {isHomeApplianceTechnician && (
                      <>
                        {appointment.apartmentNumber && appointment.floor && (
                          <div className="mt-1">
                            Apartment: {appointment.apartmentNumber}, Floor: {appointment.floor}
                          </div>
                        )}
                        {appointment.locationDescription && (
                          <div className="mt-1 italic">{appointment.locationDescription}</div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-gray-500">No upcoming appointments</p>
      )}

      <div className="mt-3 text-right">
        <button 
          className="text-primary text-sm hover:underline"
          onClick={() => {}}
        >
          View All Appointments
        </button>
      </div>
    </div>
  );
};

export default AppointmentsView; 