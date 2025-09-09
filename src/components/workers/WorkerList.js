import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkers, deleteWorker } from '../../redux/features/workerSlice';
import WorkerForm from '../forms/WorkerForm';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const WorkerList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  
  const dispatch = useDispatch();
  const { workers, loading, error } = useSelector((state) => state.worker);
  
  useEffect(() => {
    dispatch(getWorkers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  const handleAddWorker = () => {
    setIsEdit(false);
    setSelectedWorker(null);
    setIsModalOpen(true);
  };
  
  const handleEditWorker = (worker) => {
    setIsEdit(true);
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };
  
  const handleDeleteWorker = async (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await dispatch(deleteWorker({ id: workerId }));
        toast.success('Worker deleted successfully');
      } catch (error) {
        toast.error('Error deleting worker');
      }
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWorker(null);
    setIsEdit(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!workers || workers.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Workers</h2>
          <button
            onClick={handleAddWorker}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <UserPlus size={18} /> Add Worker
          </button>
        </div>
        <div className="text-center py-8 text-gray-900">
          No workers found. Add your first worker to get started.
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
              <WorkerForm
                isEdit={isEdit}
                worker={selectedWorker}
                onClose={handleCloseModal}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Workers</h2>
        <button
          onClick={handleAddWorker}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <UserPlus size={18} /> Add Worker
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((worker) => (
          <div key={worker._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{worker.firstName} {worker.lastName}</h3>
                <p className="text-sm text-gray-900">{worker.specialization}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditWorker(worker)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDeleteWorker(worker._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="text-sm">
              <p className="text-gray-900">{worker.email}</p>
              <p className="text-gray-900">{worker.phone}</p>
              <p className="text-gray-900">Experience: {worker.experience} years</p>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-xs ${worker.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {worker.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <WorkerForm
              isEdit={isEdit}
              worker={selectedWorker}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerList; 