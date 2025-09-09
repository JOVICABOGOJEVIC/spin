import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchClientsAsync,
  createClientAsync,
  updateClientAsync,
  deleteClientAsync,
  searchClients,
  clearError
} from '../../redux/features/clientSlice';
import { toast } from 'react-toastify';
import { 
  Users, UserPlus, Edit, Trash2, Mail, MapPin, Clock,
  Calendar, Search, PlusCircle, X, Pencil, Phone, FileText, UserX, Loader2, Globe
} from 'lucide-react';
import { COUNTRY_DATA } from '../../utils/countryData';
import './ClientsView.css';

// Phone prefixes mapping
const COUNTRY_PREFIXES = {
  rs: '381', // Serbia
  ba: '387', // Bosnia and Herzegovina
  hr: '385', // Croatia
  me: '382', // Montenegro
  mk: '389', // North Macedonia
  si: '386'  // Slovenia
};

// Country names mapping
const COUNTRY_NAMES = {
  ba: 'Bosnia and Herzegovina',
  rs: 'Serbia',
  hr: 'Croatia',
  me: 'Montenegro',
  mk: 'North Macedonia',
  si: 'Slovenia'
};

const ClientsView = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentClient, setCurrentClientState] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '',  // Will be set from user's country code
    street: '',
    number: '',
    floor: '',
    apartment: '',
    isHouse: false,
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  const dispatch = useDispatch();
  const { clients, filteredClients, loading, error } = useSelector((state) => state.client);
  const { user } = useSelector((state) => state.auth);
  
  const userCountryCode = user?.result?.countryCode?.toLowerCase() || 'rs'; // Default to Serbia if not set
  const phonePrefix = COUNTRY_PREFIXES[userCountryCode] || '381'; // Default to Serbian prefix if country code not found
  
  // Initialize form data with user's country code and phone prefix
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      countryCode: userCountryCode,
      phone: prev.phone || `+${phonePrefix}`
    }));
  }, [userCountryCode, phonePrefix]);

  // Load clients on component mount
  useEffect(() => {
    dispatch(fetchClientsAsync());
  }, [dispatch]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const prefix = COUNTRY_DATA[formData.countryCode].code;
      let phoneValue = value.replace(/[^\d+]/g, '');
      
      // If the user is typing a new number (not pasting a complete one)
      if (!phoneValue.startsWith('+')) {
        phoneValue = `+${prefix}${phoneValue}`;
      }
      
      setFormData(prev => ({
        ...prev,
        phone: phoneValue
      }));
      return;
    }

    if (name === 'searchTerm') {
      setSearchTerm(value);
      dispatch(searchClients(value));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate required fields
    const requiredFields = {
      name: 'Name',
      phone: 'Phone',
      street: 'Street',
      number: 'Number'
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !formData[field]?.trim())
      .map(([_, label]) => label);
    
    if (missingFields.length > 0) {
      setFormError(`Required fields missing: ${missingFields.join(', ')}`);
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      setFormError('Please enter a valid phone number (minimum 10 digits)');
      return;
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      const clientData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || undefined,
        address: {
          street: formData.street.trim(),
          number: formData.number.trim(),
          floor: !formData.isHouse && formData.floor?.trim() ? formData.floor.trim() : undefined,
          apartment: !formData.isHouse && formData.apartment?.trim() ? formData.apartment.trim() : undefined,
          isHouse: formData.isHouse || false,
          countryCode: formData.countryCode // Save the country code with the address
        },
        description: formData.description?.trim() || undefined
      };

      if (showForm && currentClient) {
        const result = await dispatch(updateClientAsync({ 
          id: currentClient._id, 
          updatedClientData: clientData 
        })).unwrap();
        console.log('Update response:', result);
        toast.success('Client successfully updated');
        resetForm();
      } else {
        const result = await dispatch(createClientAsync(clientData)).unwrap();
        console.log('Create response:', result);
        toast.success('Client successfully added');
        resetForm();
      }
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'An error occurred while saving the client';
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: `+${phonePrefix}`, // Use the current user's phone prefix
      countryCode: userCountryCode, // Use the current user's country code
      street: '',
      number: '',
      floor: '',
      apartment: '',
      isHouse: false,
      description: ''
    });
    setCurrentClientState(null);
    setShowForm(false);
  };
  
  const handleEdit = (client) => {
    setCurrentClientState(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      countryCode: client.address?.countryCode || userCountryCode,
      street: client.address?.street || '',
      number: client.address?.number || '',
      floor: client.address?.floor || '',
      apartment: client.address?.apartment || '',
      isHouse: client.address?.isHouse || false,
      description: client.description || ''
    });
    setShowForm(true);
  };
  
  const handleDelete = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await dispatch(deleteClientAsync(clientId)).unwrap();
        toast.success('Client successfully deleted');
      } catch (error) {
        toast.error(error.message || 'An error occurred while deleting the client');
      }
    }
  };
  
  const showAddForm = () => {
    resetForm();
    setShowForm(true);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const renderTableView = () => {
    return (
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-600 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-600 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-600 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-600 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{client.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <a 
                      href={`tel:${client.phone}`}
                      className="text-sm text-gray-900 hover:text-gray-700 flex items-center"
                    >
                      <Phone size={14} className="mr-1 text-gray-500" />
                      {client.phone}
                    </a>
                    {client.email && (
                      <a 
                        href={`mailto:${client.email}`}
                        className="text-sm text-gray-900 hover:text-gray-700 flex items-center"
                      >
                        <Mail size={14} className="mr-1 text-gray-500" />
                        {client.email}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {client.address?.street} {client.address?.number}
                    {!client.address?.isHouse && client.address?.floor && (
                      <span>, Floor {client.address.floor}</span>
                    )}
                    {!client.address?.isHouse && client.address?.apartment && (
                      <span>, Apt {client.address.apartment}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {client.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(client._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const [expandedCard, setExpandedCard] = useState(null);

  const renderCardView = () => {
    return (
      <div className="grid grid-cols-1 gap-4">
        {filteredClients.map(client => (
          <div
            key={client._id}
            className="bg-gray-800 p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-white">{client.name}</h3>
                <div className="text-sm text-gray-300 mt-1">
                  {client.address?.street} {client.address?.number}
                  {!client.address?.isHouse && client.address?.floor && (
                    <span>, Floor {client.address.floor}</span>
                  )}
                  {!client.address?.isHouse && client.address?.apartment && (
                    <span>, Apt {client.address.apartment}</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setExpandedCard(expandedCard === client._id ? null : client._id)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {expandedCard === client._id ? <X size={16} /> : <FileText size={16} />}
                </button>
              </div>
            </div>
            
            {(expandedCard === client._id || true) && (
              <div className="mt-4 space-y-3 pt-4 border-t border-gray-700">
                <a 
                  href={`tel:${client.phone}`}
                  className="flex items-center text-gray-300 hover:text-gray-200"
                >
                  <Phone size={16} className="mr-2 text-gray-400" />
                  {client.phone}
                </a>
                
                {client.email && (
                  <a 
                    href={`mailto:${client.email}`}
                    className="flex items-center text-gray-300 hover:text-gray-200"
                  >
                    <Mail size={16} className="mr-2 text-gray-400" />
                    {client.email}
                  </a>
                )}
                
                {client.description && (
                  <div className="flex items-start text-gray-400">
                    <FileText size={16} className="mr-2 mt-1 flex-shrink-0" />
                    <span>{client.description}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleEdit(client)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(client._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPhoneInput = () => (
    <div className="form-group">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="flex items-center px-2 py-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img
              src={`https://flagcdn.com/${formData.countryCode}.svg`}
              alt={COUNTRY_DATA[formData.countryCode]?.name}
              className="h-4 w-6"
              onError={(e) => {
                console.error("Flag loading error:", e);
                e.target.src = `https://flagcdn.com/ba.svg`;
              }}
            />
            <svg
              className="w-4 h-4 ml-1 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCountryDropdown && (
            <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50">
              {Object.entries(COUNTRY_DATA).map(([code, { name, code: prefix }]) => (
                <button
                  key={code}
                  type="button"
                  className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-600"
                  onClick={() => {
                    const oldPrefix = COUNTRY_DATA[formData.countryCode].code;
                    setFormData(prev => ({
                      ...prev,
                      countryCode: code,
                      phone: prev.phone.replace(`+${oldPrefix}`, `+${prefix}`)
                    }));
                    setShowCountryDropdown(false);
                  }}
                >
                  <img
                    src={`https://flagcdn.com/${code}.svg`}
                    alt={name}
                    className="h-4 w-6 mr-2"
                    onError={(e) => {
                      e.target.src = `https://flagcdn.com/ba.svg`;
                    }}
                  />
                  <span className="flex-1">{name}</span>
                  <span className="text-gray-400 ml-2">+{prefix}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Enter phone number"
          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="bg-gray-800 rounded-lg shadow-lg">
      <div className="border-b border-gray-700 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">
          {currentClient ? 'Edit Client' : 'Add New Client'}
        </h2>
        <button 
          onClick={resetForm}
          className="text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      
      {formError && (
        <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Client Name *"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {renderPhoneInput()}

          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            placeholder="Street Name *"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />

          <div className="flex items-center space-x-2">
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              placeholder="No. *"
              className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            
            {!formData.isHouse && (
              <>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  placeholder="Floor"
                  className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  placeholder="Apt"
                  className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </>
            )}
            
            <label className="flex items-center space-x-2 text-sm text-white">
              <input
                type="checkbox"
                name="isHouse"
                checked={formData.isHouse}
                onChange={(e) => handleInputChange({
                  target: {
                    name: 'isHouse',
                    value: e.target.checked
                  }
                })}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span>House</span>
            </label>
          </div>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            rows="3"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-2 mt-4 border-t border-gray-700 pt-4">
          <button 
            type="button" 
            onClick={resetForm}
            className="px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            {currentClient ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Clients</h2>
        {!showForm && (
          <button 
            onClick={showAddForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <UserPlus size={16} className="mr-2" />
            Add New Client
          </button>
        )}
      </div>

      {!showForm && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, email, or address..."
              value={searchTerm}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  dispatch(searchClients(''));
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1 ml-1">
            {filteredClients.length === 0 && searchTerm 
              ? 'No matches found' 
              : filteredClients.length < clients.length 
                ? `Found ${filteredClients.length} matching clients` 
                : ''}
          </p>
        </div>
      )}

      {showForm ? (
        renderForm()
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredClients.length > 0 ? (
        <div>
          <div className="hidden md:block">
            {renderTableView()}
          </div>
          <div className="md:hidden">
            {renderCardView()}
          </div>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <UserX size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No clients yet</h3>
          <p className="text-gray-400 mb-4">
            You haven't added any clients to your list
          </p>
          <button 
            onClick={showAddForm}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={16} className="mr-2" />
            Add your first client
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No matches found</h3>
          <p className="text-gray-400 mb-4">
            No clients match your search criteria: "{searchTerm}"
          </p>
          <button 
            onClick={() => {
              setSearchTerm('');
              dispatch(searchClients(''));
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <X size={16} className="mr-2" />
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientsView; 