import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getJobs } from '../../redux/features/jobSlice';
import { getWorkers } from '../../redux/features/workerSlice';
import { Calendar, Filter, Download, BarChart3, DollarSign, Package, User, Clock, Archive } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api.js';

const ArchiveView = () => {
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector((state) => state.job);
  const { workers } = useSelector((state) => state.worker || { workers: [] });
  const { user } = useSelector((state) => state.auth);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalMaterials: 0,
    totalJobs: 0,
    averageJobTime: 0
  });

  useEffect(() => {
    const businessType = user?.result?.businessType || 'Home Appliance Technician';
    dispatch(getJobs(businessType));
    dispatch(getWorkers());
  }, [dispatch, user]);

  useEffect(() => {
    // Filter completed jobs
    const completedJobs = jobs?.filter(job => job.status === 'Completed') || [];
    
    // Apply date filter
    let filtered = completedJobs;
    if (startDate && endDate) {
      filtered = completedJobs.filter(job => {
        const jobDate = new Date(job.report?.submittedAt || job.updatedAt);
        return jobDate >= new Date(startDate) && jobDate <= new Date(endDate);
      });
    }
    
    // Apply worker filter
    if (selectedWorker !== 'all') {
      filtered = filtered.filter(job => job.assignedTo === selectedWorker);
    }
    
    setFilteredJobs(filtered);
    
    // Calculate statistics
    const stats = calculateStatistics(filtered);
    setStatistics(stats);
  }, [jobs, startDate, endDate, selectedWorker]);

  const calculateStatistics = (jobs) => {
    let totalRevenue = 0;
    let totalMaterials = 0;
    let totalJobs = jobs.length;
    let totalTime = 0;
    
    jobs.forEach(job => {
      if (job.report) {
        // Parse revenue (remove currency symbols and convert to number)
        const revenue = parseFloat(job.report.serviceCharged?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        totalRevenue += revenue;
        
        // Count materials (simple count for now)
        if (job.report.materialsUsed) {
          totalMaterials += 1; // Count as 1 material per job for now
        }
        
        // Calculate total time
        const travelTime = job.report.totalTravelTime || 0;
        const workTime = job.report.totalWorkTime || 0;
        totalTime += travelTime + workTime;
      }
    });
    
    const averageJobTime = totalJobs > 0 ? totalTime / totalJobs : 0;
    
    return {
      totalRevenue,
      totalMaterials,
      totalJobs,
      averageJobTime
    };
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const exportToCSV = () => {
    const csvData = filteredJobs.map(job => ({
      'Client': job.clientName,
      'Phone': job.clientPhone,
      'Address': job.clientAddress,
      'Issue': job.issueDescription,
      'Worker': job.assignedTo,
      'Completed': new Date(job.report?.submittedAt || job.updatedAt).toLocaleDateString('sr-RS'),
      'Revenue': job.report?.serviceCharged || '',
      'Materials': job.report?.materialsUsed || '',
      'Travel Time': formatTime(job.report?.totalTravelTime || 0),
      'Work Time': formatTime(job.report?.totalWorkTime || 0)
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archive_${startDate || 'all'}_${endDate || 'all'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 p-2 sm:p-4">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-white">Arhiva</h1>
            <p className="text-xs sm:text-sm text-gray-400">Završeni poslovi i statistike</p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={filteredJobs.length === 0}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <h3 className="text-base sm:text-lg font-semibold text-white">Filteri</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Od datuma</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Do datuma</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Worker Filter */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Radnik</label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Svi radnici</option>
                {workers.map(worker => (
                  <option key={worker._id} value={worker.name}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-300">Ukupno poslova</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{statistics.totalJobs}</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-300">Ukupna naplata</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{statistics.totalRevenue.toLocaleString()} RSD</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-300">Materijali</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{statistics.totalMaterials}</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-300">Prosečno vreme</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{formatTime(statistics.averageJobTime)}</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            Završeni poslovi ({filteredJobs.length})
          </h3>
          
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Archive className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Nema završenih poslova za odabrani period</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 max-h-[calc(100vh-500px)] overflow-y-auto scrollbar-hide">
              {filteredJobs.map(job => (
                <div key={job._id} className="bg-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-600 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-white text-sm sm:text-base">{job.clientName}</span>
                        <span className="text-gray-400 hidden sm:inline">•</span>
                        <span className="text-xs sm:text-sm text-gray-400">{job.assignedTo}</span>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-300 mb-2 line-clamp-2">{job.issueDescription}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <span>📞</span>
                          <span className="truncate">{job.clientPhone}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📍</span>
                          <span className="truncate">{job.clientAddress}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{new Date(job.report?.submittedAt || job.updatedAt).toLocaleDateString('sr-RS')}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right flex-shrink-0">
                      {job.report?.serviceCharged && (
                        <div className="text-green-400 font-semibold text-sm sm:text-base">
                          {job.report.serviceCharged}
                        </div>
                      )}
                      {job.report?.materialsUsed && (
                        <div className="text-xs sm:text-sm text-gray-400 mt-1">
                          {job.report.materialsUsed.length > 30 
                            ? `${job.report.materialsUsed.substring(0, 30)}...` 
                            : job.report.materialsUsed}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime((job.report?.totalTravelTime || 0) + (job.report?.totalWorkTime || 0))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveView;
