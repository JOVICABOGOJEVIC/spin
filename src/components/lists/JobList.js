import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getJobs, deleteJob, setCurrentJob, loadMockJobs } from '../../redux/features/jobSlice';
import { toast } from 'react-toastify';
import { ArrowUpRight, Clock, Trash2, Wrench, AlertCircle, MapPin, Home, Edit } from 'lucide-react';
import { getJobFormConfig } from '../../utils/formConfig';
import { getBusinessType } from '../../utils/businessTypeUtils';

const JobList = () => {
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector((state) => state.job);
  const businessType = getBusinessType();
  const jobConfig = getJobFormConfig(businessType);

  useEffect(() => {
    if (jobs.length === 0) {
      // Učitaj mock podatke ako još nema podataka
      dispatch(loadMockJobs(businessType));
    } else {
      // Inače dohvati poslove sa API-ja
      dispatch(getJobs(businessType));
    }
  }, [dispatch, businessType, jobs.length]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      dispatch(deleteJob(id));
    }
  };

  const handleEdit = (job) => {
    console.log('Edit job:', job);
    dispatch(setCurrentJob(job._id));
    
    // Create and dispatch custom event for job-edit
    const event = new CustomEvent('job-edit', { detail: job });
    window.dispatchEvent(event);
    
    // Debugging
    console.log('Event dispatched: job-edit');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      // If it's already in HH:MM format, just return it
      if (/^\d{1,2}:\d{2}$/.test(timeString)) {
        return timeString;
      }
      
      // Otherwise try to parse it as a date
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  // Funkcija za dobijanje naziva polja iz konfiguracije
  const getFieldLabel = (fieldName) => {
    return jobConfig[fieldName]?.label || fieldName;
  };

  // Funkcija za određivanje naslova posla prema tipu biznisa
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

  // Check if this is an on-site job for a Home Appliance Technician
  const isHomeApplianceFieldService = (job) => {
    return businessType === 'Home Appliance Technician' && job.serviceLocation === 'OnSite';
  };

  if (loading) {
    return <div className="flex justify-center mt-8">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No jobs found. Create a new job to get started.
      </div>
    );
  }

  return (
    <div className="mt-6 w-full">
      <h3 className="text-lg font-semibold mb-4">{businessType} Jobs</h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <li 
            key={job._id} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-lg text-background mr-2">
                    {getJobTitle(job)}
                  </span>
                  {job.hasWarranty && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Warranty
                    </span>
                  )}
                </div>
                {/* Prikaži ID/serijski broj ako postoji, zavisno od tipa biznisa */}
                {job.serialNumber && (
                  <p className="text-gray-600 text-sm mb-2">
                    {businessType === 'Auto Mechanic' ? 'VIN: ' : 
                      businessType === 'Elevator Technician' ? 'ID: ' : 'S/N: '}
                    {job.serialNumber}
                  </p>
                )}
                <p className="text-gray-700 mb-2">{job.issueDescription}</p>
                
                {/* Client information section */}
                <div className="text-sm text-gray-600">
                  <div>Client: {job.clientName}</div>
                  {job.clientPhone && <div>Phone: {job.clientPhone}</div>}
                  
                  {/* For Home Appliance Technician field service jobs, show detailed address */}
                  {isHomeApplianceFieldService(job) ? (
                    <div className="mt-2 bg-blue-50 p-2 rounded border border-blue-100">
                      <div className="flex items-center mb-1 font-medium text-blue-700">
                        <MapPin size={14} className="mr-1" />
                        Field Service Location
                      </div>
                      <div>{job.clientAddress}</div>
                      {job.apartmentNumber && (
                        <div>Apartment: {job.apartmentNumber}</div>
                      )}
                      {job.floor && (
                        <div>Floor: {job.floor}</div>
                      )}
                      {job.locationDescription && (
                        <div className="mt-1 text-xs italic">{job.locationDescription}</div>
                      )}
                      {job.scheduledTime && (
                        <div className="mt-1 flex items-center text-blue-700">
                          <Clock size={12} className="mr-1" />
                          Scheduled: {job.serviceDate ? formatDate(job.serviceDate) : 'TBD'} at {formatTime(job.scheduledTime)}
                        </div>
                      )}
                    </div>
                  ) : job.clientAddress && (
                    <div>Address: {job.clientAddress}</div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(job)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Edit job"
                >
                  <ArrowUpRight size={18} className="text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Delete job"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
                <button 
                  onClick={() => handleEdit(job)}
                  className="p-1 rounded-full hover:bg-gray-100 text-blue-600"
                  title="Izmeni posao"
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center mt-3 space-x-2 text-xs">
              <span className={`px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
              <span className={`font-medium ${getPriorityColor(job.priority)}`}>
                {job.priority} Priority
              </span>
              
              {/* Show service location type badge for Home Appliance Technician */}
              {businessType === 'Home Appliance Technician' && (
                <span className={`px-2 py-1 rounded-full ${job.serviceLocation === 'OnSite' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {job.serviceLocation === 'OnSite' ? 'Field Service' : 'In Workshop'}
                </span>
              )}
              
              {/* Only show service date for non-field service (shown above in the field service box) */}
              {job.serviceDate && !isHomeApplianceFieldService(job) && (
                <span className="flex items-center text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {formatDate(job.serviceDate)}
                </span>
              )}
              
              {job.assignedTo && (
                <span className="flex items-center text-gray-500 ml-2">
                  <Wrench size={12} className="mr-1" />
                  {job.assignedTo}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobList; 