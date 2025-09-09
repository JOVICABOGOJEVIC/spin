import React, { useState, useEffect } from 'react';
import { getBusinessType, isBusinessType } from '../../utils/businessTypeUtils';

const RemoteSupportView = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({
    clientName: '',
    clientEmail: '',
    supportType: '',
    scheduledDate: '',
    notes: '',
    status: 'scheduled'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const businessType = getBusinessType();
  const isITTechnician = isBusinessType('IT Technician');
  
  // Support types specific to IT Technicians
  const getSupportTypes = () => [
    'Remote Troubleshooting',
    'Software Installation',
    'Security Audit',
    'Data Recovery',
    'System Update',
    'Network Configuration',
    'Training Session',
    'General Consultation'
  ];

  useEffect(() => {
    // Only load sessions if this is an IT Technician
    if (!isITTechnician) {
      setLoading(false);
      return;
    }
    
    // Mock data fetching - in a real app, this would be an API call
    const fetchSessions = () => {
      // Create mock remote support sessions
      const mockSessions = [];
      const count = Math.floor(Math.random() * 4) + 2; // 2-5 sessions
      const supportTypes = getSupportTypes();
      const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
      
      const now = new Date();
      
      for (let i = 0; i < count; i++) {
        const scheduledDate = new Date(now);
        // Some in the past, some in the future
        scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 14) - 7); 
        
        const status = scheduledDate < now ? 
          (Math.random() > 0.3 ? 'completed' : 'cancelled') : 
          (Math.random() > 0.7 ? 'in_progress' : 'scheduled');
        
        const duration = Math.floor(Math.random() * 90) + 30; // 30-120 minutes
        
        mockSessions.push({
          id: `session-${i + 1}`,
          clientName: `Client ${i + 1}`,
          clientEmail: `client${i+1}@example.com`,
          supportType: supportTypes[Math.floor(Math.random() * supportTypes.length)],
          scheduledDate: scheduledDate.toISOString().split('T')[0],
          scheduledTime: `${10 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`,
          duration,
          status,
          notes: `${status === 'completed' ? 'Session completed. ' : ''}Remote support session for ${duration} minutes.`,
          connectionDetails: 'TeamViewer ID: 123456789'
        });
      }
      
      setSessions(mockSessions);
      setLoading(false);
    };
    
    fetchSessions();
  }, [isITTechnician]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSession({ ...newSession, [name]: value });
  };

  const handleAddSession = (e) => {
    e.preventDefault();
    
    // In a real app, this would be an API call
    const newSessionWithId = {
      ...newSession,
      id: `session-${sessions.length + 1}`,
      scheduledTime: '10:00', // Default time
      duration: 60, // Default duration
      connectionDetails: 'Meeting details will be sent by email'
    };
    
    setSessions([...sessions, newSessionWithId]);
    setNewSession({
      clientName: '',
      clientEmail: '',
      supportType: '',
      scheduledDate: '',
      notes: '',
      status: 'scheduled'
    });
    setShowAddForm(false);
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Check if session is today
  const isSessionToday = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  // Count sessions by status
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const todaySessions = sessions.filter(s => isSessionToday(s.scheduledDate)).length;

  // If not IT Technician, show a message
  if (!isITTechnician) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-700">
          Remote support features are only available for IT Technicians.
        </p>
      </div>
    );
  }

  return (
    <div className="remote-support-view">
      {/* Sessions status summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-blue-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-blue-800">Scheduled</h3>
          <p className="text-lg font-bold">{scheduledSessions}</p>
        </div>
        <div className="bg-yellow-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-yellow-800">Today</h3>
          <p className="text-lg font-bold">{todaySessions}</p>
        </div>
        <div className="bg-green-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-green-800">Completed</h3>
          <p className="text-lg font-bold">{completedSessions}</p>
        </div>
      </div>

      {/* Session form or list */}
      {showAddForm ? (
        <form onSubmit={handleAddSession} className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-3">Schedule Remote Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              name="clientName"
              placeholder="Client Name"
              value={newSession.clientName}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="email"
              name="clientEmail"
              placeholder="Client Email"
              value={newSession.clientEmail}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            />
            <select
              name="supportType"
              value={newSession.supportType}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            >
              <option value="">Select Support Type</option>
              {getSupportTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                name="scheduledDate"
                value={newSession.scheduledDate}
                onChange={handleInputChange}
                required
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="md:col-span-2">
              <textarea
                name="notes"
                placeholder="Session Notes"
                value={newSession.notes}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                rows="2"
              ></textarea>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-3 py-1 bg-primary text-white rounded"
            >
              Schedule Session
            </button>
          </div>
        </form>
      ) : (
        <>
          <button 
            onClick={() => setShowAddForm(true)} 
            className="mb-4 px-3 py-1 bg-primary text-white rounded-md text-sm"
          >
            Schedule New Session
          </button>
          
          {loading ? (
            <p>Loading remote support sessions...</p>
          ) : sessions.length > 0 ? (
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client/Type</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map(session => (
                    <tr key={session.id}>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{session.clientName}</div>
                        <div className="text-xs text-gray-500">{session.supportType}</div>
                        <div className="text-xs text-gray-400">{session.clientEmail}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className={`text-sm ${isSessionToday(session.scheduledDate) ? 'font-bold text-primary' : ''}`}>
                          {session.scheduledDate}
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.scheduledTime} ({session.duration} min)
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(session.status)}`}>
                          {formatStatus(session.status)}
                        </span>
                        {session.status === 'scheduled' && (
                          <div className="mt-1 text-xs text-blue-600">
                            {session.connectionDetails}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No remote support sessions found. Schedule a session to get started.</p>
          )}
        </>
      )}
    </div>
  );
};

export default RemoteSupportView; 