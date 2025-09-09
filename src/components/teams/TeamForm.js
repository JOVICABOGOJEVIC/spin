import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createTeam, updateTeam } from '../../redux/actions/teamActions';

const TeamForm = ({ isEdit, team, onClose, availableWorkers }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workers: [],
    isActive: true
  });

  useEffect(() => {
    if (isEdit && team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        workers: team.workers || [],
        isActive: team.isActive !== undefined ? team.isActive : true
      });
    }
  }, [isEdit, team]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWorkerSelection = (workerId) => {
    setFormData(prev => ({
      ...prev,
      workers: prev.workers.includes(workerId)
        ? prev.workers.filter(id => id !== workerId)
        : [...prev.workers, workerId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Molimo unesite naziv tima');
      return;
    }

    try {
      if (isEdit) {
        await dispatch(updateTeam(team._id, formData));
        toast.success('Tim je uspešno ažuriran');
      } else {
        await dispatch(createTeam(formData));
        toast.success('Tim je uspešno kreiran');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri čuvanju tima');
    }
  };

  const baseInputClass = "w-full border border-gray-600 rounded px-2 py-1.5 text-xs text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow h-8";
  const labelClass = "block text-xs font-medium text-white mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="border-b border-gray-700 p-4">
          <h2 className="text-lg font-medium text-white">
            {isEdit ? 'Izmena tima' : 'Novi tim'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Naziv tima *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={baseInputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Opis</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`${baseInputClass} h-20`}
                rows={3}
              />
            </div>

            <div>
              <label className={labelClass}>Članovi tima</label>
              <div className="mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-gray-900 p-2 rounded">
                {availableWorkers.map(worker => (
                  <div
                    key={worker._id}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      id={`worker-${worker._id}`}
                      checked={formData.workers.includes(worker._id)}
                      onChange={() => handleWorkerSelection(worker._id)}
                      className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`worker-${worker._id}`}
                      className="text-sm text-white cursor-pointer"
                    >
                      {worker.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-white">
                Aktivan tim
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEdit ? 'Sačuvaj izmene' : 'Kreiraj tim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamForm; 