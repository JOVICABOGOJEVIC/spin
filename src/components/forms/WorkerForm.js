import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createWorker, updateWorker } from '../../redux/features/workerSlice';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';

const WorkerForm = ({ isEdit, worker, onClose }) => {
  const specializationOptions = [
    { value: 'pomocni radnik', label: 'Pomoćni radnik', coefficient: 1 },
    { value: 'junior', label: 'Junior', coefficient: 2 },
    { value: 'medior', label: 'Medior', coefficient: 3 },
    { value: 'senior', label: 'Senior', coefficient: 4 },
    { value: 'leader', label: 'Leader', coefficient: 5 }
  ];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: 'junior',
    specializationCoefficient: 2,
    experience: '',
    active: true
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (isEdit && worker) {
      setFormData({
        firstName: worker.firstName || '',
        lastName: worker.lastName || '',
        email: worker.email || '',
        phone: worker.phone || '',
        specialization: worker.specialization || 'junior',
        specializationCoefficient: worker.specializationCoefficient || 2,
        experience: worker.experience || '',
        active: worker.active !== undefined ? worker.active : true
      });
    }
  }, [isEdit, worker]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If specialization changes, automatically set coefficient
    if (name === 'specialization') {
      const selectedOption = specializationOptions.find(opt => opt.value === value);
      setFormData(prev => ({
        ...prev,
        specialization: value,
        specializationCoefficient: selectedOption ? selectedOption.coefficient : 1
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEdit) {
        await dispatch(updateWorker({ id: worker._id, updatedWorkerData: formData }));
        toast.success('Radnik je uspešno ažuriran');
      } else {
        await dispatch(createWorker({ workerData: formData }));
        toast.success('Radnik je uspešno dodat');
      }
      onClose();
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          {isEdit ? 'Izmeni radnika' : 'Dodaj novog radnika'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Ime
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Prezime
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Specijalizacija
            </label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {specializationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} (Koeficijent: {option.coefficient})
                </option>
              ))}
            </select>
            {formData.specializationCoefficient && (
              <p className="mt-1 text-xs text-gray-500">
                Koeficijent: {formData.specializationCoefficient}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Iskustvo (godine)
            </label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700 rounded"
          />
          <label className="ml-2 block text-sm text-gray-300">
            Aktivan
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Otkaži
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isEdit ? 'Sačuvaj izmene' : 'Dodaj radnika'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkerForm; 