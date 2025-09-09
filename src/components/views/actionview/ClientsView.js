import React, { useState, useEffect } from 'react';
import HeaderSection from '../../header/HeaderSection.js';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  Users, UserPlus, Edit, Trash2, Phone, MapPin, 
  Calendar, Search, PlusCircle, RefreshCw, X
} from 'lucide-react';
import { getBusinessType } from '../../../utils/businessTypeUtils';
import { businessTypeHasFeature } from '../../../utils/businessTypeConfig';

// Phone prefixes mapping
const COUNTRY_PREFIXES = {
  rs: '381', // Serbia
  ba: '387', // Bosnia and Herzegovina
  hr: '385', // Croatia
  me: '382', // Montenegro
  mk: '389', // North Macedonia
  si: '386'  // Slovenia
};

const ClientsView = ({ title, onNavigateBack }) => {
  const [activeView, setActiveView] = useState('list'); // 'list', 'add', 'edit'
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const countryCode = user?.countryCode?.toLowerCase() || 'rs';
  const phonePrefix = COUNTRY_PREFIXES[countryCode] || '381';
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    apartmentNumber: '',
    floor: '',
    locationDescription: '',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const businessType = getBusinessType();
  const hasOnSiteService = businessTypeHasFeature(businessType, 'hasOnSiteService');
  const isHomeApplianceTechnician = businessType === 'Home Appliance Technician';
  
  // Mock function to load clients - would be replaced with actual API calls
  useEffect(() => {
    setLoading(true);
    // Mock data
    const mockClients = [
      {
        _id: '1',
        name: 'Marko Petrović',
        phone: '+381601234567',
        email: 'marko@example.com',
        address: 'Bulevar Oslobođenja 56, Beograd',
        apartmentNumber: '12',
        floor: '3',
        locationDescription: 'Zgrada pored pekare, interfon ne radi, pozvati na mobilni.',
        lastVisit: '2023-05-01'
      },
      {
        _id: '2',
        name: 'Ana Jovanović',
        phone: '+381603214567',
        email: 'ana@example.com',
        address: 'Cara Dušana 14, Beograd',
        apartmentNumber: '5A',
        floor: '1',
        locationDescription: 'Stara zgrada, lift ne radi.',
        lastVisit: '2023-04-20'
      },
      {
        _id: '3',
        name: 'Nikola Nikolić',
        phone: '+381641234567',
        email: 'nikola@example.com',
        address: 'Knez Mihailova 22, Beograd',
        apartmentNumber: '8',
        floor: '2',
        locationDescription: '',
        lastVisit: null
      }
    ];
    setClients(mockClients);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initialize phone with prefix when form is reset
    setFormData(prev => ({
      ...prev,
      phone: prev.phone || `+${phonePrefix}`
    }));
  }, [phonePrefix]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Ensure prefix is always present
      if (!value.startsWith(`+${phonePrefix}`)) {
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = {
      name: 'Name',
      phone: 'Phone',
      address: 'Address'
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !formData[field]?.trim())
      .map(([_, label]) => label);
    
    if (missingFields.length > 0) {
      toast.error(`Required fields missing: ${missingFields.join(', ')}`);
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    if (activeView === 'edit' && currentClient) {
      // Update client
      const updatedClients = clients.map(client => 
        client._id === currentClient._id ? { ...client, ...formData } : client
      );
      setClients(updatedClients);
      toast.success('Client updated successfully');
    } else {
      // Add new client
      const newClient = {
        _id: Date.now().toString(),
        ...formData,
        lastVisit: null,
        description: formData.notes // Use notes as the single description field
      };
      setClients([...clients, newClient]);
      toast.success('Client added successfully');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '' // Single description field
    });
    setCurrentClient(null);
    setActiveView('list');
  };

  const handleEdit = (client) => {
    setCurrentClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      apartmentNumber: client.apartmentNumber || '',
      floor: client.floor || '',
      locationDescription: client.locationDescription || '',
      notes: client.notes || ''
    });
    setActiveView('edit');
  };

  const handleDelete = (clientId) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovog klijenta?')) {
      const updatedClients = clients.filter(client => client._id !== clientId);
      setClients(updatedClients);
      toast.success('Klijent je uspešno obrisan');
    }
  };

  const showList = () => setActiveView('list');
  const showAddForm = () => {
    resetForm();
    setActiveView('add');
  };
  
  const onAdd = () => {
    showAddForm();
  };
  
  const onRead = () => {
    showList();
  };
  
  const onBack = () => {
    if (activeView !== 'list') {
      resetForm();
      showList();
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.phone.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.address && client.address.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Nikad';
    
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className='w-full p-4'>
      <HeaderSection 
        title={title || 'Upravljanje klijentima'} 
        onAdd={activeView === 'list' ? onAdd : null}
        onRead={activeView !== 'list' ? onRead : null}
        onBack={onBack}
      />
      
      <div className="mt-6 w-full">
        {activeView === 'list' && (
          <div>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pretraži klijente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            {/* Clients List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-2 text-gray-600">Učitavanje klijenata...</p>
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map(client => (
                  <div key={client._id} className="border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition-shadow">
                    <div className="border-b p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => handleEdit(client)}
                            className="p-1 rounded-full hover:bg-gray-100 text-blue-600"
                            title="Izmeni klijenta"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(client._id)}
                            className="p-1 rounded-full hover:bg-gray-100 text-red-600"
                            title="Obriši klijenta"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <Phone size={14} className="mr-1" />
                        <span>{client.phone}</span>
                      </div>
                      
                      {client.email && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span>{client.email}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 bg-gray-50">
                      {client.address && (
                        <div className="text-sm text-gray-600 mb-2 flex items-start">
                          <MapPin size={14} className="mr-1 mt-1 shrink-0" />
                          <div>
                            <div>{client.address}</div>
                            {isHomeApplianceTechnician && (
                              <>
                                {client.apartmentNumber && client.floor && (
                                  <div className="text-xs mt-1">
                                    Stan: {client.apartmentNumber}, Sprat: {client.floor}
                                  </div>
                                )}
                                {client.locationDescription && (
                                  <div className="text-xs italic mt-1">{client.locationDescription}</div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Calendar size={12} className="mr-1" />
                        <span>Poslednja poseta: {formatDate(client.lastVisit)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nije pronađen nijedan klijent. Dodajte prvog klijenta da biste počeli.
              </div>
            )}
          </div>
        )}
        
        {(activeView === 'add' || activeView === 'edit') && (
          <div className="bg-white p-4 rounded-md shadow-md mx-auto">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">
              {activeView === 'edit' ? 'Edit Client' : 'Add New Client'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <div className="flex items-center">
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded px-2">
                      <img 
                        src={`https://flagcdn.com/${countryCode}.svg`}
                        alt={countryCode}
                        className="h-4 w-6 mr-2"
                      />
                      <span className="text-white">+{phonePrefix}</span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="flex-1 ml-2 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  {activeView === 'edit' ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsView; 