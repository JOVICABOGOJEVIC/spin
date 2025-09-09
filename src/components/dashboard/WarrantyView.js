import React, { useState, useEffect } from 'react';
import { getBusinessType } from '../../utils/businessTypeUtils';

const WarrantyView = () => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warranty, setWarranty] = useState({
    customerName: '',
    item: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const businessType = getBusinessType();
  
  // Get warranty duration in days based on business type
  const getDefaultWarrantyDuration = () => {
    switch(businessType) {
      case 'Home Appliance Technician':
        return 90; // 3 months
      case 'Electrician':
        return 180; // 6 months
      case 'Plumber':
        return 180; // 6 months
      case 'Auto Mechanic':
        return 90; // 3 months for parts
      case 'HVAC Technician':
        return 365; // 1 year
      case 'Carpenter':
        return 365; // 1 year
      case 'Locksmith':
        return 90; // 3 months
      case 'Tile Installer':
        return 730; // 2 years
      case 'Painter':
        return 365; // 1 year
      default:
        return 30; // 1 month default
    }
  };
  
  // Get label for warranty items based on business type
  const getItemLabel = () => {
    switch(businessType) {
      case 'Home Appliance Technician':
        return 'Appliance';
      case 'Auto Mechanic':
        return 'Vehicle/Part';
      case 'HVAC Technician':
        return 'System/Component';
      default:
        return 'Service/Product';
    }
  };
  
  // Get warranty item suggestion placeholders based on business type
  const getItemPlaceholder = () => {
    switch(businessType) {
      case 'Home Appliance Technician':
        return 'e.g., Samsung Refrigerator RF28K9380SG';
      case 'Auto Mechanic':
        return 'e.g., 2019 Škoda Octavia - Brake Pads';
      case 'HVAC Technician':
        return 'e.g., Midea Split AC System - Compressor';
      case 'Electrician':
        return 'e.g., Electrical Panel Installation';
      case 'Plumber':
        return 'e.g., Water Heater Replacement';
      default:
        return 'Enter product or service';
    }
  };

  useEffect(() => {
    // Mock data fetching - in a real app, this would be an API call
    const fetchWarranties = () => {
      // Create mock warranties based on business type
      const mockWarranties = [];
      const count = Math.floor(Math.random() * 5) + 2; // 2-6 warranties
      
      const now = new Date();
      const defaultDuration = getDefaultWarrantyDuration();
      
      for (let i = 0; i < count; i++) {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60)); // Start 0-60 days ago
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + defaultDuration);
        
        const isExpired = endDate < now;
        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        
        let itemDescription = '';
        switch(businessType) {
          case 'Home Appliance Technician':
            itemDescription = ['Refrigerator', 'Washing Machine', 'Dishwasher', 'Oven', 'Dryer'][Math.floor(Math.random() * 5)];
            break;
          case 'Auto Mechanic':
            itemDescription = ['Brake System', 'Engine Repair', 'Transmission', 'Oil Change', 'Timing Belt'][Math.floor(Math.random() * 5)];
            break;
          case 'HVAC Technician':
            itemDescription = ['AC Unit', 'Furnace', 'Thermostat', 'Ventilation System', 'Heat Pump'][Math.floor(Math.random() * 5)];
            break;
          default:
            itemDescription = `Service ${i + 1}`;
        }
        
        mockWarranties.push({
          id: `warranty-${i + 1}`,
          customerName: `Customer ${i + 1}`,
          item: itemDescription,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          isExpired,
          daysRemaining,
          notes: isExpired ? 'Expired warranty' : 'Standard warranty terms apply.'
        });
      }
      
      setWarranties(mockWarranties);
      setLoading(false);
    };
    
    fetchWarranties();
  }, [businessType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWarranty({ ...warranty, [name]: value });
  };

  const handleAddWarranty = (e) => {
    e.preventDefault();
    
    const startDate = new Date(warranty.startDate);
    const endDate = new Date(warranty.endDate);
    
    const now = new Date();
    const isExpired = endDate < now;
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    // In a real app, this would be an API call
    const newWarrantyWithId = {
      ...warranty,
      id: `warranty-${warranties.length + 1}`,
      isExpired,
      daysRemaining
    };
    
    setWarranties([...warranties, newWarrantyWithId]);
    setWarranty({
      customerName: '',
      item: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  // Calculate the date X days from today
  const calculateEndDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // Handle setting warranty start date to today and end date based on duration
  const setTodayWithDuration = () => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = calculateEndDate(getDefaultWarrantyDuration());
    
    setWarranty({
      ...warranty,
      startDate: today,
      endDate: endDate
    });
  };

  // Calculate statistics
  const activeWarranties = warranties.filter(w => !w.isExpired).length;
  const expiredWarranties = warranties.filter(w => w.isExpired).length;
  const soonExpiringWarranties = warranties.filter(w => !w.isExpired && w.daysRemaining <= 30).length;

  return (
    <div className="warranty-view">
      {/* Warranty status summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-green-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-green-800">Active</h3>
          <p className="text-lg font-bold">{activeWarranties}</p>
        </div>
        <div className="bg-yellow-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-yellow-800">Expiring Soon</h3>
          <p className="text-lg font-bold">{soonExpiringWarranties}</p>
        </div>
        <div className="bg-red-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-red-800">Expired</h3>
          <p className="text-lg font-bold">{expiredWarranties}</p>
        </div>
      </div>

      {/* Warranty form or list */}
      {showAddForm ? (
        <form onSubmit={handleAddWarranty} className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-3">Add New Warranty</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              name="customerName"
              placeholder="Customer Name"
              value={warranty.customerName}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="item"
              placeholder={getItemPlaceholder()}
              value={warranty.item}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            />
            <div>
              <label className="block text-xs text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={warranty.startDate}
                onChange={handleInputChange}
                required
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={warranty.endDate}
                onChange={handleInputChange}
                required
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="md:col-span-2">
              <textarea
                name="notes"
                placeholder="Warranty Notes"
                value={warranty.notes}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                rows="2"
              ></textarea>
            </div>
          </div>
          <div className="flex gap-2 justify-between">
            <button 
              type="button" 
              onClick={setTodayWithDuration}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Set Default Dates
            </button>
            <div>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 bg-gray-200 rounded mr-2"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-3 py-1 bg-primary text-white rounded"
              >
                Add Warranty
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <button 
            onClick={() => setShowAddForm(true)} 
            className="mb-4 px-3 py-1 bg-primary text-white rounded-md text-sm"
          >
            Add New Warranty
          </button>
          
          {loading ? (
            <p>Loading warranties...</p>
          ) : warranties.length > 0 ? (
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer/{getItemLabel()}</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {warranties.map(warranty => (
                    <tr key={warranty.id}>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{warranty.customerName}</div>
                        <div className="text-xs text-gray-500">{warranty.item}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{warranty.startDate}</div>
                        <div className="text-sm text-gray-900">to {warranty.endDate}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {warranty.isExpired ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Expired
                          </span>
                        ) : warranty.daysRemaining <= 30 ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            {warranty.daysRemaining} days left
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No warranties found. Add a warranty to get started.</p>
          )}
        </>
      )}
    </div>
  );
};

export default WarrantyView; 