import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkers, deleteWorker } from '../../redux/features/workerSlice';
import { getJobs } from '../../redux/features/jobSlice';
import WorkerForm from '../forms/WorkerForm';
import { UserPlus, Pencil, Trash2, Calendar, Clock, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

const WorkerList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('month'); // 'week', 'month', 'quarter'
  
  const dispatch = useDispatch();
  const { workers, loading, error } = useSelector((state) => state.worker);
  const { jobs } = useSelector((state) => state.job || { jobs: [] });
  const { user } = useSelector((state) => state.auth || {});
  
  // Calculate date range based on period
  const getDateRange = (period) => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }
    return { start, end: now };
  };
  
  // Calculate worker statistics
  const calculateWorkerStats = (worker) => {
    const { start, end } = getDateRange(statsPeriod);
    const workerName = `${worker.firstName} ${worker.lastName}`;
    
    // Filter jobs assigned to this worker and completed in the period
    const workerJobs = jobs?.filter(job => {
      if (job.status !== 'Completed' || !job.report) return false;
      
      const assignedMatch = job.assignedTo === workerName || 
                          job.assignedTo === worker.firstName ||
                          job.assignedTo === worker.lastName ||
                          job.assignedTo === worker._id;
      
      if (!assignedMatch) return false;
      
      const completedDate = new Date(job.report.submittedAt || job.updatedAt);
      return completedDate >= start && completedDate <= end;
    }) || [];
    
    // Calculate statistics
    const addresses = workerJobs.length;
    let totalTravelTime = 0; // in seconds
    let totalWorkTime = 0; // in seconds
    let totalRevenue = 0; // in RSD
    
    workerJobs.forEach(job => {
      if (job.report) {
        totalTravelTime += job.report.totalTravelTime || 0;
        totalWorkTime += job.report.totalWorkTime || 0;
        
        // Parse revenue
        const revenueStr = job.report.serviceCharged || '0';
        const revenue = parseFloat(revenueStr.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        totalRevenue += revenue;
      }
    });
    
    return {
      addresses,
      totalTravelTime,
      totalWorkTime,
      totalRevenue,
      totalTime: totalTravelTime + totalWorkTime
    };
  };
  
  // Calculate net salary formula
  // Formula: (Base Salary × Specialization Coefficient) + (Revenue × Performance Bonus Rate)
  // Base Salary is calculated based on specialization and experience
  // Performance Bonus is based on revenue generated
  const calculateNetSalary = (worker, stats) => {
    const coeff = worker.specializationCoefficient || 1;
    const baseSalaryPerHour = 500; // Base hourly rate in RSD
    const hoursWorked = stats.totalTime / 3600; // Convert seconds to hours
    
    // Base salary calculation
    const baseSalary = baseSalaryPerHour * hoursWorked * coeff;
    
    // Performance bonus (percentage of revenue generated)
    const performanceBonusRate = 0.15; // 15% of revenue goes to worker
    const performanceBonus = stats.totalRevenue * performanceBonusRate;
    
    // Total before taxes
    const grossSalary = baseSalary + performanceBonus;
    
    // Tax deduction (assuming 20% tax)
    const taxRate = 0.20;
    const tax = grossSalary * taxRate;
    
    // Net salary
    const netSalary = grossSalary - tax;
    
    return {
      baseSalary,
      performanceBonus,
      grossSalary,
      tax,
      netSalary,
      hoursWorked: hoursWorked.toFixed(2)
    };
  };
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  useEffect(() => {
    const businessType = user?.result?.businessType || 'Home Appliance Technician';
    dispatch(getWorkers());
    dispatch(getJobs(businessType));
  }, [dispatch, user]);

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
      <div className="bg-gray-900 min-h-screen p-2 sm:p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!workers || workers.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen p-2 sm:p-4">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Workers</h2>
            <button
              onClick={handleAddWorker}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={18} /> 
              <span className="hidden sm:inline">Add Worker</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 sm:p-8 text-center text-gray-400 shadow-lg">
          No workers found. Add your first worker to get started.
        </div>
        
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
    <div className="bg-gray-900 min-h-screen p-2 sm:p-4">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Radnici</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Period Selector */}
            <select
              value={statsPeriod}
              onChange={(e) => setStatsPeriod(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Nedelja</option>
              <option value="month">Mesec</option>
              <option value="quarter">Kvartal</option>
            </select>
            <button
              onClick={handleAddWorker}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={18} /> 
              <span className="hidden sm:inline">Dodaj radnika</span>
              <span className="sm:hidden">Dodaj</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Worker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {workers.map((worker) => {
          const stats = calculateWorkerStats(worker);
          const salary = calculateNetSalary(worker, stats);
          
          return (
            <div key={worker._id} className="bg-gray-800 p-3 sm:p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                    {worker.firstName?.charAt(0)}{worker.lastName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-white truncate">
                      {worker.firstName} {worker.lastName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">
                      {worker.specialization || 'N/A'} 
                      {worker.specializationCoefficient && ` (×${worker.specializationCoefficient})`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2">
                  <button
                    onClick={() => handleEditWorker(worker)}
                    className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
                    title="Izmeni radnika"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteWorker(worker._id)}
                    className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                    title="Obriši radnika"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Statistics */}
              <div className="text-xs sm:text-sm space-y-2 border-t border-gray-700 pt-2 sm:pt-3">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <p className="truncate" title={worker.email}>📧 {worker.email}</p>
                  <p className="truncate" title={worker.phone}>📞 {worker.phone}</p>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <div>
                      <div className="text-gray-400 text-xs">Adrese</div>
                      <div className="text-white font-medium">{stats.addresses}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <div>
                      <div className="text-gray-400 text-xs">Vreme</div>
                      <div className="text-white font-medium text-xs">{formatTime(stats.totalTime)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-green-400" />
                    <div>
                      <div className="text-gray-400 text-xs">Revenue</div>
                      <div className="text-white font-medium text-xs">{stats.totalRevenue.toLocaleString()} RSD</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-yellow-400" />
                    <div>
                      <div className="text-gray-400 text-xs">Neto Plata</div>
                      <div className="text-white font-medium text-xs">{Math.round(salary.netSalary).toLocaleString()} RSD</div>
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div className="pt-2 border-t border-gray-700">
                  <span className={`px-2 py-1 rounded text-xs ${worker.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {worker.active ? 'Aktivan' : 'Neaktivan'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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