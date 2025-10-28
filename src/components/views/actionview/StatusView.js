import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getJobs } from '../../../redux/features/jobSlice';
import { getWorkers } from '../../../redux/features/workerSlice';
import { getBusinessType } from '../../../utils/businessTypeUtils';
import WorkersStatusDashboard from '../WorkersStatusDashboard';
import axios from 'axios';
import { 
  Users, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Coffee, 
  UserCheck,
  Wrench
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StatusView = () => {
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector((state) => state.job);
  const { workers } = useSelector((state) => state.worker || { workers: [] });
  const { user } = useSelector((state) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workersStatus, setWorkersStatus] = useState([]);
  const businessType = getBusinessType();
  
  // Fetch workers status from database
  const fetchWorkersStatus = async () => {
    try {
      const profile = JSON.parse(localStorage.getItem('profile') || '{}');
      const token = profile?.token;
      if (!token) return;
      
      const response = await axios.get(
        `${API_BASE_URL}/api/worker/status/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkersStatus(response.data || []);
    } catch (error) {
      console.error('Error fetching workers status:', error);
    }
  };
  
  useEffect(() => {
    dispatch(getJobs(businessType));
    dispatch(getWorkers());
    fetchWorkersStatus();
    
    // Refresh workers status every 10 seconds
    const statusInterval = setInterval(fetchWorkersStatus, 10000);
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timer);
      clearInterval(statusInterval);
    };
  }, [dispatch, businessType]);
  
  // Calculate statistics based on calendar view mode
  const calculateStatistics = (viewMode = 'day') => {
    const today = new Date();
    let filteredJobs = jobs || [];
    
    if (viewMode === 'day') {
      // Filter jobs for today
      filteredJobs = jobs?.filter(job => {
        if (!job.serviceDate) return false;
        const jobDate = new Date(job.serviceDate);
        return jobDate.toDateString() === today.toDateString();
      }) || [];
    } else if (viewMode === 'week') {
      // Filter jobs for current week
      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diff = day === 0 ? -6 : 1 - day; // Monday start
      startOfWeek.setDate(today.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      filteredJobs = jobs?.filter(job => {
        if (!job.serviceDate) return false;
        const jobDate = new Date(job.serviceDate);
        return jobDate >= startOfWeek && jobDate <= endOfWeek;
      }) || [];
    } else if (viewMode === 'month') {
      // Filter jobs for current month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      filteredJobs = jobs?.filter(job => {
        if (!job.serviceDate) return false;
        const jobDate = new Date(job.serviceDate);
        return jobDate >= startOfMonth && jobDate <= endOfMonth;
      }) || [];
    }
    
    return {
      totalJobs: filteredJobs.length,
      scheduledJobs: filteredJobs.filter(job => job.serviceDate && job.status !== 'Completed' && job.status !== 'Cancelled').length,
      pendingJobs: filteredJobs.filter(job => job.status === 'In Pending' || job.status === 'Received').length,
      inProgressJobs: filteredJobs.filter(job => job.status === 'In Repair' || job.status === 'Diagnosing' || job.status === 'On Road' || job.status === 'At Client').length,
      completedJobs: filteredJobs.filter(job => job.status === 'Completed').length
    };
  };

  // Calculate progress percentage based on view mode
  const calculateProgress = (viewMode, currentCount) => {
    const limits = {
      day: 10,    // 10 jobs per day
      week: 50,   // 50 jobs per week  
      month: 200  // 200 jobs per month
    };
    
    const limit = limits[viewMode] || limits.day;
    return Math.min((currentCount / limit) * 100, 100);
  };

  const stats = calculateStatistics('day'); // Default to day view
  const progressPercentage = calculateProgress('day', stats.totalJobs);
  
  // Additional calculations for urgent jobs and other metrics
  const urgentJobs = jobs?.filter(job => job.priority === 'Urgent' && job.status !== 'Completed') || [];
  const pendingJobs = jobs?.filter(job => job.status === 'In Pending' || job.status === 'Received') || [];
  const inProgressJobs = jobs?.filter(job => job.status === 'In Repair' || job.status === 'Diagnosing' || job.status === 'On Road' || job.status === 'At Client') || [];
  
  // Worker status tracking
  const getWorkerJobs = (workerId) => {
    return jobs?.filter(job => job.assignedTo === workerId) || [];
  };
  
  const getWorkerCurrentJob = (workerId) => {
    return jobs?.find(job => 
      job.assignedTo === workerId && 
      (job.status === 'In Repair' || job.status === 'Diagnosing')
    );
  };
  
  const getWorkerStatus = (worker, currentJob) => {
    // First check database worker status (most accurate)
    const workerStatusFromDB = workersStatus.find(ws => ws.workerId?._id === worker._id || ws.workerId === worker._id);
    if (workerStatusFromDB?.status) {
      // Map database statuses to UI statuses
      const statusMap = {
        'on_the_road': 'on_the_road',
        'at_client': 'at_client',
        'on_break': 'on_break',
        'offline': 'offline',
        'available': 'available',
        'completed': 'available'
      };
      const mappedStatus = statusMap[workerStatusFromDB.status];
      if (mappedStatus) return mappedStatus;
    }
    
    // Fallback: check if worker has a manual status set
    if (worker.currentStatus === 'on_break') {
      return 'on_break';
    }
    if (worker.currentStatus === 'offline') {
      return 'offline';
    }
    
    if (!currentJob) {
      const hasScheduled = jobs?.some(job => 
        job.assignedTo === worker._id && 
        job.serviceDate && 
        new Date(job.serviceDate) > new Date()
      );
      return hasScheduled ? 'scheduled' : 'available';
    }
    
    // Determine if on route or at client based on job service location
    if (currentJob.serviceLocation === 'OnSite') {
      return 'at_client';
    } else {
      return 'in_workshop';
    }
  };
  
  const StatCard = ({ icon: Icon, label, value, color, subtext, progress }) => (
    <div className={`bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
          {progress !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% od maksimuma</p>
            </div>
          )}
        </div>
        <Icon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600" />
      </div>
    </div>
  );
  
  const WorkerCard = ({ worker }) => {
    const workerJobs = getWorkerJobs(worker._id);
    const currentJob = getWorkerCurrentJob(worker._id);
    const status = getWorkerStatus(worker, currentJob);
    
    const statusConfig = {
      available: { icon: UserCheck, label: 'Dostupan', color: 'bg-green-100 text-green-800', iconColor: 'text-green-600' },
      scheduled: { icon: Clock, label: 'Zakazan', color: 'bg-blue-100 text-blue-800', iconColor: 'text-blue-600' },
      on_the_road: { icon: MapPin, label: 'U putu', color: 'bg-blue-100 text-blue-800', iconColor: 'text-blue-600' },
      in_workshop: { icon: Wrench, label: 'U servisu', color: 'bg-purple-100 text-purple-800', iconColor: 'text-purple-600' },
      at_client: { icon: Wrench, label: 'Kod stranke', color: 'bg-orange-100 text-orange-800', iconColor: 'text-orange-600' },
      on_break: { icon: Coffee, label: 'Na pauzi', color: 'bg-gray-100 text-gray-800', iconColor: 'text-gray-600' },
      offline: { icon: AlertCircle, label: 'Offline', color: 'bg-red-100 text-red-800', iconColor: 'text-red-600' }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    const StatusIcon = config.icon;
    
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg">
              {worker.firstName?.charAt(0)}{worker.lastName?.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base text-white">{worker.firstName} {worker.lastName}</h4>
              <p className="text-xs text-gray-400">{worker.specialization || 'Tehničar'}</p>
            </div>
          </div>
          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
            <StatusIcon className={`h-3 w-3 ${config.iconColor}`} />
            <span className="hidden sm:inline">{config.label}</span>
              </div>
            </div>
        
        {currentJob && (
          <div className="mb-3 p-2 sm:p-3 bg-gray-700 rounded-md border-l-2 border-orange-500">
            <p className="text-xs text-gray-400 mb-1">Trenutni posao:</p>
            <p className="font-medium text-xs sm:text-sm text-white">{currentJob.clientName}</p>
            <p className="text-xs text-gray-400">{currentJob.clientAddress || currentJob.clientPhone}</p>
            <p className="text-xs text-gray-500 mt-1">{currentJob.issueDescription?.substring(0, 50)}...</p>
        </div>
      )}
        
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-400">Ukupno</p>
            <p className="text-base sm:text-lg font-bold text-white">{workerJobs.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Aktivni</p>
            <p className="text-base sm:text-lg font-bold text-blue-400">
              {workerJobs.filter(j => !['Completed', 'Cancelled'].includes(j.status)).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Završeni</p>
            <p className="text-base sm:text-lg font-bold text-green-400">
              {workerJobs.filter(j => j.status === 'Completed').length}
            </p>
          </div>
        </div>
    </div>
  );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className='w-full p-2 sm:p-4 bg-gray-900 min-h-screen'>
      {/* Header - Dark theme like Jobs */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Status</h1>
      </div>
      
      {/* Current Time and Date - Dark theme */}
      <div className="bg-gray-800 text-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {currentTime.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              {currentTime.toLocaleDateString('sr-RS', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-400">Aktivni poslovi</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">{inProgressJobs.length}</p>
          </div>
        </div>
      </div>
      
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={ClipboardList}
          label="Ukupno poslova"
          value={stats.totalJobs}
          color="border-blue-500"
          subtext="Svi poslovi u sistemu"
          progress={progressPercentage}
        />
        <StatCard 
          icon={Clock}
          label="Zakazani"
          value={stats.scheduledJobs}
          color="border-purple-500"
          subtext={`${stats.pendingJobs} na čekanju`}
        />
        <StatCard 
          icon={Wrench}
          label="U radu"
          value={stats.inProgressJobs}
          color="border-orange-500"
          subtext="Aktivni servisi"
        />
        <StatCard 
          icon={CheckCircle}
          label="Završeno"
          value={stats.completedJobs}
          color="border-green-500"
          subtext="Kompletiranih poslova"
        />
      </div>
      
      {/* Urgent Jobs Alert */}
      {urgentJobs.length > 0 && (
        <div className="bg-red-900/20 border-l-4 border-red-500 p-3 sm:p-4 mb-4 sm:mb-6 rounded-r-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-red-400">Hitni poslovi: {urgentJobs.length}</h3>
              <p className="text-xs sm:text-sm text-red-300">
                {urgentJobs.slice(0, 3).map(j => j.clientName).join(', ')}
                {urgentJobs.length > 3 && ` i još ${urgentJobs.length - 3}`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Workers Status */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
          <h3 className="text-lg sm:text-xl font-bold text-white">Status radnika</h3>
          <span className="text-xs sm:text-sm text-gray-500">({workers?.length || 0} aktivnih)</span>
        </div>
        
        {workers && workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {workers.filter(w => w.active).map(worker => (
              <WorkerCard key={worker._id} worker={worker} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 sm:p-8 text-center text-gray-500">
            Nema aktivnih radnika u sistemu
          </div>
        )}
      </div>
      
      {/* Pending Jobs Queue */}
      {pendingJobs.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Red čekanja ({pendingJobs.length})</h3>
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {pendingJobs.map((job, index) => (
                <div 
                  key={job._id}
                  className={`p-3 sm:p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                    index === 0 ? 'bg-yellow-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm text-gray-300">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-white truncate">{job.clientName}</h4>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">{job.clientAddress || job.clientPhone}</p>
                        <p className="text-xs text-gray-500 truncate">{job.issueDescription?.substring(0, 60)}...</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        job.priority === 'Urgent' ? 'bg-red-900/50 text-red-400' :
                        job.priority === 'High' ? 'bg-orange-900/50 text-orange-400' :
                        job.priority === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-green-900/50 text-green-400'
                      }`}>
                        {job.priority}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(job.createdAt).toLocaleDateString('sr-RS')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
      </div>
        </div>
      )}

      {/* Workers Status Dashboard */}
      <WorkersStatusDashboard />
    </div>
  );
};

export default StatusView;
