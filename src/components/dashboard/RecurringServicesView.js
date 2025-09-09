import React, { useState, useEffect } from 'react';
import { getBusinessType } from '../../utils/businessTypeUtils';

const RecurringServicesView = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({
    clientName: '',
    serviceType: '',
    frequency: 'monthly',
    nextDate: '',
    notes: '',
    contractNumber: '',
    status: 'active'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const businessType = getBusinessType();
  
  // Get service types based on business type
  const getServiceTypes = () => {
    switch(businessType) {
      case 'HVAC Technician':
        return [
          'Air Conditioner Maintenance', 
          'Heating System Maintenance', 
          'Ventilation Cleaning', 
          'Filter Replacement', 
          'System Inspection', 
          'Complete HVAC Service'
        ];
      case 'Elevator Technician':
        return [
          'Monthly Inspection', 
          'Quarterly Maintenance', 
          'Annual Certification', 
          'Safety Testing', 
          'Preventative Maintenance',
          'Full Service Contract'
        ];
      case 'IT Technician':
        return [
          'Network Maintenance', 
          'Hardware Checks', 
          'Security Updates', 
          'Backup Verification', 
          'System Optimization', 
          'Full IT Support'
        ];
      case 'Auto Mechanic':
        return [
          'Oil Change', 
          'Regular Maintenance',
          'Seasonal Inspection', 
          'Full Service Package',
          'Fleet Maintenance'
        ];
      default:
        return ['Regular Maintenance', 'Inspection', 'Service Contract', 'Custom Service'];
    }
  };
  
  // Generate service frequencies based on business type
  const getFrequencyOptions = () => {
    const commonOptions = [
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Every 3 Months' },
      { value: 'biannual', label: 'Every 6 Months' },
      { value: 'annual', label: 'Yearly' }
    ];
    
    // Add business-specific options
    switch(businessType) {
      case 'Auto Mechanic':
        return [
          ...commonOptions,
          { value: 'mileage', label: 'By Mileage' }
        ];
      case 'IT Technician':
        return [
          { value: 'daily', label: 'Daily' },
          ...commonOptions,
          { value: 'custom', label: 'Custom Schedule' }
        ];
      default:
        return commonOptions;
    }
  };
  
  useEffect(() => {
    // Mock data fetching - in a real app, this would be an API call
    const fetchServices = () => {
      // Create mock services based on business type
      const mockServices = [];
      const count = Math.floor(Math.random() * 4) + 2; // 2-5 services
      const serviceTypes = getServiceTypes();
      const frequencies = getFrequencyOptions().map(opt => opt.value);
      const statuses = ['active', 'pending', 'paused'];
      
      const now = new Date();
      
      for (let i = 0; i < count; i++) {
        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + Math.floor(Math.random() * 60)); // Next 60 days
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
        
        mockServices.push({
          id: `service-${i + 1}`,
          clientName: `Client ${i + 1}`,
          serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
          frequency,
          nextDate: nextDate.toISOString().split('T')[0],
          contractNumber: `CONT-${1000 + i}`,
          status,
          lastServiceDate: (() => {
            const lastDate = new Date(nextDate);
            
            // Calculate last service date based on frequency
            switch(frequency) {
              case 'weekly':
                lastDate.setDate(lastDate.getDate() - 7);
                break;
              case 'monthly':
                lastDate.setMonth(lastDate.getMonth() - 1);
                break;
              case 'quarterly':
                lastDate.setMonth(lastDate.getMonth() - 3);
                break;
              case 'biannual':
                lastDate.setMonth(lastDate.getMonth() - 6);
                break;
              case 'annual':
                lastDate.setFullYear(lastDate.getFullYear() - 1);
                break;
              default:
                lastDate.setDate(lastDate.getDate() - 30);
            }
            
            return lastDate.toISOString().split('T')[0];
          })(),
          notes: `Standard ${frequency} maintenance service contract.`
        });
      }
      
      setServices(mockServices);
      setLoading(false);
    };
    
    fetchServices();
  }, [businessType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService({ ...newService, [name]: value });
  };

  const handleAddService = (e) => {
    e.preventDefault();
    
    // Calculate a suitable last service date based on frequency and next date
    const nextDate = new Date(newService.nextDate);
    const lastServiceDate = new Date(nextDate);
    
    switch(newService.frequency) {
      case 'weekly':
        lastServiceDate.setDate(lastServiceDate.getDate() - 7);
        break;
      case 'monthly':
        lastServiceDate.setMonth(lastServiceDate.getMonth() - 1);
        break;
      case 'quarterly':
        lastServiceDate.setMonth(lastServiceDate.getMonth() - 3);
        break;
      case 'biannual':
        lastServiceDate.setMonth(lastServiceDate.getMonth() - 6);
        break;
      case 'annual':
        lastServiceDate.setFullYear(lastServiceDate.getFullYear() - 1);
        break;
      default:
        lastServiceDate.setDate(lastServiceDate.getDate() - 30);
    }
    
    // In a real app, this would be an API call
    const newServiceWithId = {
      ...newService,
      id: `service-${services.length + 1}`,
      lastServiceDate: lastServiceDate.toISOString().split('T')[0]
    };
    
    setServices([...services, newServiceWithId]);
    setNewService({
      clientName: '',
      serviceType: '',
      frequency: 'monthly',
      nextDate: '',
      notes: '',
      contractNumber: '',
      status: 'active'
    });
    setShowAddForm(false);
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format frequency for display
  const formatFrequency = (frequency) => {
    const frequencyMap = {
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'biannual': 'Bi-Annual',
      'annual': 'Annual',
      'mileage': 'By Mileage',
      'daily': 'Daily',
      'custom': 'Custom'
    };
    
    return frequencyMap[frequency] || frequency;
  };

  // Check if service is due soon (within 7 days)
  const isServiceDueSoon = (nextDate) => {
    const today = new Date();
    const serviceDate = new Date(nextDate);
    const diffTime = serviceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  };

  // Count services by status
  const activeServices = services.filter(s => s.status === 'active').length;
  const pendingServices = services.filter(s => s.status === 'pending').length;
  const dueSoonServices = services.filter(s => s.status === 'active' && isServiceDueSoon(s.nextDate)).length;

  return (
    <div className="recurring-services-view">
      {/* Services status summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-green-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-green-800">Active</h3>
          <p className="text-lg font-bold">{activeServices}</p>
        </div>
        <div className="bg-yellow-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-yellow-800">Due Soon</h3>
          <p className="text-lg font-bold">{dueSoonServices}</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-blue-800">Pending</h3>
          <p className="text-lg font-bold">{pendingServices}</p>
        </div>
      </div>

      {/* Service form or list */}
      {showAddForm ? (
        <form onSubmit={handleAddService} className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-3">Add New Service Contract</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              name="clientName"
              placeholder="Client Name"
              value={newService.clientName}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="contractNumber"
              placeholder="Contract Number"
              value={newService.contractNumber}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <select
              name="serviceType"
              value={newService.serviceType}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            >
              <option value="">Select Service Type</option>
              {getServiceTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              name="frequency"
              value={newService.frequency}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            >
              {getFrequencyOptions().map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Next Service Date</label>
              <input
                type="date"
                name="nextDate"
                value={newService.nextDate}
                onChange={handleInputChange}
                required
                className="border p-2 rounded w-full"
              />
            </div>
            <select
              name="status"
              value={newService.status}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="paused">Paused</option>
            </select>
            <div className="md:col-span-2">
              <textarea
                name="notes"
                placeholder="Service Notes"
                value={newService.notes}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                rows="2"
              ></textarea>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-3 py-1 bg-primary text-white rounded"
            >
              Add Service
            </button>
          </div>
        </form>
      ) : (
        <>
          <button 
            onClick={() => setShowAddForm(true)} 
            className="mb-4 px-3 py-1 bg-primary text-white rounded-md text-sm"
          >
            Add Service Contract
          </button>
          
          {loading ? (
            <p>Loading service contracts...</p>
          ) : services.length > 0 ? (
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client/Service</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map(service => (
                    <tr key={service.id}>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{service.clientName}</div>
                        <div className="text-xs text-gray-500">{service.serviceType}</div>
                        <div className="text-xs text-gray-400">{service.contractNumber}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatFrequency(service.frequency)}</div>
                        <div className={`text-xs ${isServiceDueSoon(service.nextDate) ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                          Next: {service.nextDate}
                        </div>
                        <div className="text-xs text-gray-400">
                          Last: {service.lastServiceDate}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(service.status)}`}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No recurring services found. Add a service contract to get started.</p>
          )}
        </>
      )}
    </div>
  );
};

export default RecurringServicesView; 