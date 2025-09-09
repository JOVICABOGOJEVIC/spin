import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addClient } from '../../redux/actions/clientActions';
import { X } from 'lucide-react';
import { getClientFormConfig } from '../../utils/formConfig';

const AddClientForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const formConfig = getClientFormConfig();
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    email: '',
    birthDate: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addClient(formData));
      onClose();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const renderField = (fieldName, fieldConfig) => {
    const { type, placeholder, required, className } = fieldConfig;

    return (
      <div key={fieldName} className="mb-2">
        <input
          type={type}
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleChange}
          placeholder={placeholder}
          className={className}
          required={required}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-white">Add New Client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-700 p-1.5 rounded-md">
            <div className="space-y-0">
              {Object.entries(formConfig).map(([fieldName, fieldConfig]) => 
                renderField(fieldName, fieldConfig)
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1.5 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientForm; 