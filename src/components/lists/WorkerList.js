import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkers, deleteWorker, setCurrentWorker } from '../../redux/features/workerSlice';
import { toast } from 'react-toastify';
import { ArrowUpRight, Trash2, Phone, Mail, Briefcase, Wrench, CheckCircle, XCircle } from 'lucide-react';

const WorkerList = () => {
  const dispatch = useDispatch();
  const { workers, loading } = useSelector((state) => state.worker || { workers: [], loading: false });

  useEffect(() => {
    dispatch(getWorkers());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this technician?')) {
      dispatch(deleteWorker({ id }));
    }
  };

  const handleEdit = (worker) => {
    dispatch(setCurrentWorker(worker));
    const event = new CustomEvent('worker-edit', { detail: worker });
    window.dispatchEvent(event);
  };

  if (loading) {
    return <div className="flex justify-center mt-8">Loading technicians...</div>;
  }

  if (!workers || workers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No technicians found. Add a new technician to get started.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <ul className="grid grid-cols-1 gap-4">
        {workers.map((worker) => (
          <li 
            key={worker._id} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <h3 className="font-semibold text-lg text-background">
                    {worker.firstName} {worker.lastName}
                  </h3>
                  {worker.active ? (
                    <span className="ml-2 flex items-center text-green-600 text-xs">
                      <CheckCircle size={14} className="mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="ml-2 flex items-center text-red-600 text-xs">
                      <XCircle size={14} className="mr-1" />
                      Inactive
                    </span>
                  )}
                </div>
                
                {worker.specialization && (
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Wrench size={14} className="mr-1" />
                    {worker.specialization}
                    {worker.experience && (
                      <span className="ml-2">
                        • {worker.experience} years
                      </span>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-1 mt-2">
                  {worker.phone && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone size={14} className="mr-2" />
                      {worker.phone}
                    </div>
                  )}
                  
                  {worker.email && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Mail size={14} className="mr-2" />
                      {worker.email}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(worker)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Edit technician"
                >
                  <ArrowUpRight size={16} className="text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(worker._id)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Delete technician"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkerList; 