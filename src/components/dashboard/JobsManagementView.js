import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getJobs, deleteJob, loadMockJobs } from '../../redux/features/jobSlice';
import { getBusinessType } from '../../utils/businessTypeUtils';
import { getJobFormConfig } from '../../utils/formConfig';
import { toast } from 'react-toastify';
import { 
  Briefcase, Trash2, Edit, Filter, MapPin, Wrench, 
  Clock, Search, PlusCircle, RefreshCw, X
} from 'lucide-react';
import JobForm from '../forms/JobForm';

const JOB_LOCATIONS = {
  ALL: 'all',
  FIELD: 'field',
  WORKSHOP: 'workshop'
};

// Različiti statusi poslova
const JOB_STATUSES = [
  'All',
  'Received', 
  'Diagnosing',
  'Waiting for Parts', 
  'In Repair',
  'In Service',
  'Completed', 
  'Delivered',
  'Cancelled',
  'Remote Support'
];

const JobsManagementView = () => {
  const dispatch = useDispatch();
  const { jobs = [], loading = false } = useSelector((state) => state.job || { jobs: [], loading: false });
  const businessType = getBusinessType();
  const jobConfig = getJobFormConfig(businessType);
  
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All',
    location: JOB_LOCATIONS.ALL,
    search: ''
  });

  useEffect(() => {
    // Only load mock jobs if needed and not already loading
    if (!loading && (!jobs || jobs.length === 0)) {
      dispatch(loadMockJobs(businessType));
    }
  }, [dispatch, businessType, jobs, loading]);

  const handleDeleteJob = (id) => {
    if (window.confirm('Da li ste sigurni da želite obrisati ovaj posao?')) {
      dispatch(deleteJob(id));
      toast.success('Posao uspešno obrisan');
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      status: 'All',
      location: JOB_LOCATIONS.ALL,
      search: ''
    });
  };

  // Određivanje lokacije posla (terenski ili servis) na osnovu biznis tipa i vrste posla
  const getJobLocation = (job) => {
    if (!job) return null;
    
    switch (businessType) {
      case 'Auto Mechanic':
        return job.onSiteService ? JOB_LOCATIONS.FIELD : JOB_LOCATIONS.WORKSHOP;
        
      case 'Plumber':
      case 'Electrician':
      case 'HVAC Technician':
        // Ovi tipovi uglavnom rade terenski posao
        return JOB_LOCATIONS.FIELD;
        
      case 'IT Technician':
        // IT tehničari mogu raditi na terenu ili daljinski
        return job.remoteSupport ? 'remote' : JOB_LOCATIONS.FIELD;
        
      case 'Home Appliance Technician':
        // Popravke kućnih uređaja mogu biti na terenu ili u radionici
        return job.serviceLocation === 'OnSite' ? JOB_LOCATIONS.FIELD : JOB_LOCATIONS.WORKSHOP;
        
      case 'Elevator Technician':
        // Liftovi se uvek servisiraju na terenu
        return JOB_LOCATIONS.FIELD;
        
      default:
        return job.onSiteService ? JOB_LOCATIONS.FIELD : JOB_LOCATIONS.WORKSHOP;
    }
  };

  // Filtriranje poslova
  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => {
    if (!job) return false;
    
    // Filter po statusu
    if (filters.status !== 'All' && job.status !== filters.status) {
      return false;
    }
    
    // Filter po lokaciji
    if (filters.location !== JOB_LOCATIONS.ALL) {
      const jobLocation = getJobLocation(job);
      if (jobLocation !== filters.location) {
        return false;
      }
    }
    
    // Filter po tekstu za pretragu
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        (job.clientName && job.clientName.toLowerCase().includes(searchLower)) ||
        (job.deviceType && job.deviceType.toLowerCase().includes(searchLower)) ||
        (job.issueDescription && job.issueDescription.toLowerCase().includes(searchLower)) ||
        (job.brand && job.brand.toLowerCase().includes(searchLower)) ||
        (job.model && job.model.toLowerCase().includes(searchLower)) ||
        (job.serialNumber && job.serialNumber.toLowerCase().includes(searchLower));
        
      if (!matchesSearch) {
        return false;
      }
    }
    
    return true;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Delivered':
        return 'bg-blue-100 text-blue-800';
      case 'In Repair':
      case 'In Service':
        return 'bg-yellow-100 text-yellow-800';
      case 'Diagnosing':
        return 'bg-orange-100 text-orange-800';
      case 'Waiting for Parts':
        return 'bg-purple-100 text-purple-800';
      case 'Received':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Remote Support':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'text-red-700 font-bold';
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Funkcija za dobijanje naslova posla
  const getJobTitle = (job) => {
    switch (businessType) {
      case 'Auto Mechanic':
        return `${job.deviceType || 'Vehicle'} ${job.brand ? `- ${job.brand}` : ''} ${job.model ? job.model : ''}`;
      case 'IT Technician':
        return `${job.deviceType || 'Device'} ${job.brand ? `- ${job.brand}` : ''} ${job.model ? job.model : ''}`;
      case 'Electrician':
        return `${job.deviceType || 'Electrical Service'}`;
      case 'Plumber':
        return `${job.deviceType || 'Plumbing Service'}`;
      case 'HVAC Technician':
        return `${job.deviceType || 'HVAC System'} ${job.brand ? `- ${job.brand}` : ''}`;
      case 'Elevator Technician':
        return `${job.deviceType || 'Elevator'} ${job.brand ? `- ${job.brand}` : ''}`;
      default:
        return `${job.deviceType || 'Appliance'} ${job.brand ? `- ${job.brand}` : ''}`;
    }
  };

  if (showForm) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{editingJob ? 'Izmena posla' : 'Novi posao'}</h2>
          <button 
            onClick={handleCloseForm} 
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        <JobForm 
          isEdit={!!editingJob} 
          onClose={handleCloseForm} 
          jobData={editingJob} 
        />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <Briefcase className="mr-2" size={24} />
          Upravljanje poslovima
        </h2>
        <button
          onClick={handleAddJob}
          className="px-4 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primaryDark transition-colors flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Novi posao
        </button>
      </div>

      {/* Filter controls */}
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtriraj po statusu</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              {JOB_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtriraj po lokaciji</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('location', JOB_LOCATIONS.ALL)}
                className={`flex-1 py-2 px-4 rounded flex items-center justify-center ${
                  filters.location === JOB_LOCATIONS.ALL 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Filter size={14} className="mr-1" />
                Svi
              </button>
              <button
                onClick={() => handleFilterChange('location', JOB_LOCATIONS.FIELD)}
                className={`flex-1 py-2 px-4 rounded flex items-center justify-center ${
                  filters.location === JOB_LOCATIONS.FIELD 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <MapPin size={14} className="mr-1" />
                Teren
              </button>
              <button
                onClick={() => handleFilterChange('location', JOB_LOCATIONS.WORKSHOP)}
                className={`flex-1 py-2 px-4 rounded flex items-center justify-center ${
                  filters.location === JOB_LOCATIONS.WORKSHOP 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Wrench size={14} className="mr-1" />
                Radionica
              </button>
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pretraga</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Pretraži po klijentu, uređaju..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="py-2 px-4 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center"
            >
              <RefreshCw size={14} className="mr-1" />
              Resetuj
            </button>
          </div>
        </div>
      </div>

      {/* Job list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Učitavanje poslova...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map(job => (
            <div key={job._id} className="border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition-shadow">
              <div className="border-b p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{getJobTitle(job)}</h3>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEditJob(job)}
                      className="p-1 rounded-full hover:bg-gray-100 text-blue-600"
                      title="Izmeni posao"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteJob(job._id)}
                      className="p-1 rounded-full hover:bg-gray-100 text-red-600"
                      title="Obriši posao"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {job.serialNumber && (
                  <p className="text-sm text-gray-600">
                    {businessType === 'Auto Mechanic' ? 'VIN: ' : 
                      businessType === 'Elevator Technician' ? 'ID: ' : 'S/N: '}
                    {job.serialNumber}
                  </p>
                )}
                
                <p className="text-sm mt-2 text-gray-700 line-clamp-2">{job.issueDescription}</p>
              </div>
              
              <div className="p-4 bg-gray-50">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <div className="mr-2 font-medium">Klijent:</div>
                  <div className="truncate">{job.clientName}</div>
                </div>
                
                {job.clientPhone && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <div className="mr-2 font-medium">Telefon:</div>
                    <div className="truncate">{job.clientPhone}</div>
                  </div>
                )}
                
                {job.serviceDate && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Clock size={14} className="mr-1" />
                    <div className="truncate">{formatDate(job.serviceDate)}</div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  <span className={`text-xs font-medium ${getPriorityColor(job.priority)}`}>
                    {job.priority} Priority
                  </span>
                </div>
                
                <div className="flex items-center mt-3 text-xs">
                  <div className={`px-2 py-1 rounded-full mr-1 ${
                    getJobLocation(job) === JOB_LOCATIONS.FIELD 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getJobLocation(job) === JOB_LOCATIONS.FIELD ? 'Field Service' : 'Workshop Repair'}
                  </div>
                  {job.assignedTo && (
                    <div className="text-gray-600">
                      Assigned to: {job.assignedTo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Nije pronađen nijedan posao koji odgovara vašim filterima. Pokušajte prilagoditi kriterijume pretrage.
        </div>
      )}
    </div>
  );
};

export default JobsManagementView; 