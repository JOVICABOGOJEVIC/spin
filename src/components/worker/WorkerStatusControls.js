import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Pause, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const WorkerStatusControls = ({ jobId, onStatusChange }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [currentStatus, setCurrentStatus] = useState('available');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchMyStatus();
  }, []);

  const fetchMyStatus = async () => {
    try {
      const token = user?.token;
      const response = await axios.get(
        `${API_BASE_URL}/api/worker/my-status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentStatus(response.data.status);
      setLocation(response.data.location || '');
      setNotes(response.data.notes || '');
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const updateStatus = async (newStatus, jobId = null) => {
    try {
      setLoading(true);
      const token = user?.token;
      
      await axios.put(
        `${API_BASE_URL}/api/worker/${user.result._id}/status`,
        {
          status: newStatus,
          currentJobId: jobId,
          location,
          notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrentStatus(newStatus);
      toast.success(`Status ažuriran: ${getStatusLabel(newStatus)}`);
      
      if (onStatusChange) {
        onStatusChange(newStatus, jobId);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Greška pri ažuriranju statusa');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'available': 'Dostupan',
      'on_the_road': 'U putu',
      'at_client': 'Kod stranke',
      'on_break': 'Na pauzi',
      'offline': 'Offline'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-green-500',
      'on_the_road': 'bg-blue-500',
      'at_client': 'bg-purple-500',
      'on_break': 'bg-yellow-500',
      'offline': 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'available': <CheckCircle className="h-4 w-4" />,
      'on_the_road': <MapPin className="h-4 w-4" />,
      'at_client': <Clock className="h-4 w-4" />,
      'on_break': <Pause className="h-4 w-4" />,
      'offline': <AlertCircle className="h-4 w-4" />
    };
    return icons[status] || <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Moj Status</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(currentStatus)} text-white`}>
          {getStatusIcon(currentStatus)}
          {getStatusLabel(currentStatus)}
        </div>
      </div>

      {/* Location and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lokacija
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Unesite lokaciju..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Napomene
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dodajte napomene..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Status Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => updateStatus('available')}
          disabled={loading || currentStatus === 'available'}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStatus === 'available'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CheckCircle className="h-4 w-4" />
          Dostupan
        </button>

        <button
          onClick={() => updateStatus('on_the_road', jobId)}
          disabled={loading || currentStatus === 'on_the_road'}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStatus === 'on_the_road'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <MapPin className="h-4 w-4" />
          U putu
        </button>

        <button
          onClick={() => updateStatus('at_client', jobId)}
          disabled={loading || currentStatus === 'at_client'}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStatus === 'at_client'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Clock className="h-4 w-4" />
          Kod stranke
        </button>

        <button
          onClick={() => updateStatus('on_break')}
          disabled={loading || currentStatus === 'on_break'}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStatus === 'on_break'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-yellow-600 hover:text-white'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Pause className="h-4 w-4" />
          Pauza
        </button>
      </div>
    </div>
  );
};

export default WorkerStatusControls;
