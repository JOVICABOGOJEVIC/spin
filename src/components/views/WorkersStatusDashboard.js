import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Pause, CheckCircle, AlertCircle, User, Phone } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const WorkersStatusDashboard = () => {
  const [workersStatus, setWorkersStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useState(JSON.parse(localStorage.getItem('profile') || '{}'));

  useEffect(() => {
    fetchWorkersStatus();
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchWorkersStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchWorkersStatus = async () => {
    try {
      console.log('🔍 Fetching workers status...');
      console.log('👤 User:', user);
      console.log('🔑 Token:', user?.token);
      console.log('🌐 API URL:', `${API_BASE_URL}/api/worker/status/all`);
      
      const token = user?.token;
      const response = await axios.get(
        `${API_BASE_URL}/api/worker/status/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkersStatus(response.data);
      console.log('👥 Workers Status:', response.data);
    } catch (error) {
      console.error('💥 Error fetching workers status:', error);
      console.error('Status:', error?.response?.status);
      console.error('Message:', error?.response?.data?.message);
      toast.error('Greška pri učitavanju statusa radnika');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-green-500',
      'on_the_road': 'bg-blue-500',
      'at_client': 'bg-purple-500',
      'on_break': 'bg-yellow-500',
      'offline': 'bg-gray-500',
      'completed': 'bg-green-600'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'available': 'Dostupan',
      'on_the_road': 'U putu',
      'at_client': 'Kod stranke',
      'on_break': 'Na pauzi',
      'offline': 'Offline',
      'completed': 'Završeno'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'available': <CheckCircle className="h-5 w-5" />,
      'on_the_road': <MapPin className="h-5 w-5" />,
      'at_client': <Clock className="h-5 w-5" />,
      'on_break': <Pause className="h-5 w-5" />,
      'offline': <AlertCircle className="h-5 w-5" />,
      'completed': <CheckCircle className="h-5 w-5" />
    };
    return icons[status] || <AlertCircle className="h-5 w-5" />;
  };

  const formatLastUpdated = (date) => {
    const now = new Date();
    const updated = new Date(date);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Upravo sada';
    if (diffMins < 60) return `Pre ${diffMins} min`;
    if (diffMins < 1440) return `Pre ${Math.floor(diffMins / 60)}h`;
    return `Pre ${Math.floor(diffMins / 1440)} dana`;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <User className="h-8 w-8" />
          Status Radnika
        </h1>
        <p className="text-gray-400 mt-2">
          Pregled lokacije i statusa svih radnika
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-gray-400">Dostupni</p>
              <p className="text-xl font-semibold text-white">
                {workersStatus.filter(w => w.status === 'available').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-gray-400">U putu</p>
              <p className="text-xl font-semibold text-white">
                {workersStatus.filter(w => w.status === 'on_the_road').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-400" />
            <div className="ml-3">
              <p className="text-sm text-gray-400">Kod stranke</p>
              <p className="text-xl font-semibold text-white">
                {workersStatus.filter(w => w.status === 'at_client').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <Pause className="h-8 w-8 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-gray-400">Na pauzi</p>
              <p className="text-xl font-semibold text-white">
                {workersStatus.filter(w => w.status === 'on_break').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-gray-400" />
            <div className="ml-3">
              <p className="text-sm text-gray-400">Offline</p>
              <p className="text-xl font-semibold text-white">
                {workersStatus.filter(w => w.status === 'offline').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-400">Završeno</p>
              <p className="text-xl font-semibold text-white">
                {workersStatus.filter(w => w.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workersStatus.map((worker) => (
          <div key={worker._id} className="bg-gray-800 rounded-lg p-4">
            {/* Worker Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {worker.workerId?.firstName?.charAt(0)}{worker.workerId?.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {worker.workerId?.firstName} {worker.workerId?.lastName}
                  </h3>
                  <p className="text-sm text-gray-400">{worker.workerId?.email}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(worker.status)} text-white`}>
                {getStatusIcon(worker.status)}
                {getStatusLabel(worker.status)}
              </div>
            </div>

            {/* Current Job */}
            {worker.currentJobId && (
              <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Trenutni posao</h4>
                <p className="text-white text-sm">{worker.currentJobId.issueDescription}</p>
                {worker.currentJobId.serviceDate && (
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(worker.currentJobId.serviceDate).toLocaleDateString()}
                    {worker.currentJobId.scheduledTime && ` u ${worker.currentJobId.scheduledTime}`}
                  </p>
                )}
                {worker.currentJobId.clientName && (
                  <p className="text-blue-400 text-xs mt-1">
                    Stranka: {worker.currentJobId.clientName}
                  </p>
                )}
              </div>
            )}

            {/* Location and Notes */}
            <div className="space-y-2">
              {worker.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{worker.location}</span>
                </div>
              )}
              {worker.notes && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-300">{worker.notes}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">
                  Poslednji put ažurirano: {formatLastUpdated(worker.lastUpdated)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workersStatus.length === 0 && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Nema radnika</h3>
          <p className="text-gray-500">Radnici će se pojaviti ovde kada se prijave</p>
        </div>
      )}
    </div>
  );
};

export default WorkersStatusDashboard;
