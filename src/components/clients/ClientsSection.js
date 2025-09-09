import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClients } from '../../actions/clientActions';
import AddClientForm from './AddClientForm';

const ClientsSection = () => {
  const dispatch = useDispatch();
  const clients = useSelector(state => state.clients.list);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(getClients());
  }, [dispatch]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Clients</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 flex items-center"
        >
          <span className="mr-2">+</span>
          Add New Client
        </button>
      </div>

      {showAddForm && (
        <AddClientForm onClose={() => setShowAddForm(false)} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
          <div
            key={client._id}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-white mb-2">{client.fullName}</h3>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center">
                <span className="w-20 text-gray-400">Address:</span>
                {client.address}
              </p>
              <p className="flex items-center">
                <span className="w-20 text-gray-400">Phone:</span>
                {client.phone}
              </p>
              <p className="flex items-center">
                <span className="w-20 text-gray-400">Email:</span>
                {client.email}
              </p>
              {client.birthDate && (
                <p className="flex items-center">
                  <span className="w-20 text-gray-400">Birth Date:</span>
                  {new Date(client.birthDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsSection; 