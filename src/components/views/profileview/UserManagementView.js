import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkers } from '../../../redux/features/workerSlice';
import { 
  Users, 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  CheckCircle,
  XCircle,
  Settings,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UserManagementView = () => {
  const dispatch = useDispatch();
  const { workers, loading } = useSelector((state) => state.worker);
  const { user } = useSelector((state) => state.auth);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(getWorkers());
  }, [dispatch]);

  const handleSetPassword = async (workerId) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Lozinka mora imati najmanje 6 karaktera');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Lozinke se ne poklapaju');
      return;
    }

    try {
      const token = user?.token;
      console.log('Setting password for worker:', workerId);
      console.log('API URL:', `${API_BASE_URL}/api/worker/${workerId}/set-password`);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/worker/${workerId}/set-password`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Password set successfully:', response.data);
      toast.success('Lozinka uspešno postavljena');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      dispatch(getWorkers());
    } catch (error) {
      console.error('Error setting password:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Greška pri postavljanju lozinke';
      toast.error(errorMessage);
    }
  };

  const handleToggleAccess = async (workerId, currentStatus) => {
    try {
      console.log('🔄 Frontend: Toggle Access Request');
      console.log('  Worker ID:', workerId);
      console.log('  Current Status:', currentStatus);
      console.log('  New Status:', !currentStatus);
      console.log('  API URL:', `${API_BASE_URL}/api/worker/${workerId}`);
      
      const token = user?.token;
      const response = await axios.patch(
        `${API_BASE_URL}/api/worker/${workerId}`,
        { hasAccess: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Frontend: Toggle successful');
      console.log('  Response:', response.data);

      toast.success(currentStatus ? 'Pristup onemogućen' : 'Pristup omogućen');
      dispatch(getWorkers());
    } catch (error) {
      console.error('❌ Frontend: Toggle failed');
      console.error('  Error:', error);
      console.error('  Status:', error?.response?.status);
      console.error('  Message:', error?.response?.data?.message);
      
      toast.error('Greška pri ažuriranju pristupa');
    }
  };

  const handleUpdatePermissions = async (workerId, permissions) => {
    try {
      const token = user?.token;
      await axios.patch(
        `${API_BASE_URL}/api/worker/${workerId}`,
        { permissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Dozvole uspešno ažurirane');
      setShowPermissionsModal(false);
      dispatch(getWorkers());
    } catch (error) {
      toast.error('Greška pri ažuriranju dozvola');
      console.error(error);
    }
  };

  const PermissionsModal = ({ worker, onClose }) => {
    const [permissions, setPermissions] = useState(worker?.permissions || {
      canViewAllJobs: false,
      canEditJobs: false,
      canDeleteJobs: false,
      canViewClients: false,
      canEditClients: false,
      canViewWorkers: false,
      canViewStatus: true
    });

    const permissionsList = [
      { 
        key: 'canViewAllJobs', 
        label: 'Vidi sve poslove', 
        description: 'Radnik može videti sve poslove. Ako NIJE čekirano, radnik vidi samo poslove dodeljene njemu.' 
      },
      { key: 'canEditJobs', label: 'Edituj poslove', description: 'Može menjati detalje poslova' },
      { key: 'canDeleteJobs', label: 'Briši poslove', description: 'Može brisati poslove' },
      { key: 'canViewClients', label: 'Vidi klijente', description: 'Pristup listi klijenata' },
      { key: 'canEditClients', label: 'Edituj klijente', description: 'Može menjati podatke klijenata' },
      { key: 'canViewWorkers', label: 'Vidi radnike', description: 'Pristup listi radnika' },
      { key: 'canViewStatus', label: 'Vidi status', description: 'Pristup dispečerskom centru' }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Dozvole za {worker?.firstName} {worker?.lastName}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Special highlight for canViewAllJobs */}
            {!permissions.canViewAllJobs && (
              <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
                  <CheckCircle className="h-5 w-5" />
                  Podrazumevano: Radnik vidi samo svoje poslove
                </div>
                <p className="text-sm text-yellow-200">
                  Radnik će videti samo poslove gde je "Assigned To" = {worker?.firstName} {worker?.lastName}
                </p>
              </div>
            )}
            
            {permissionsList.map(({ key, label, description }) => (
              <div key={key} className={`bg-gray-700 p-4 rounded-lg ${key === 'canViewAllJobs' ? 'border-2 border-blue-500' : ''}`}>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions[key] || false}
                    onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                    className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-white font-medium">{label}</div>
                    <div className="text-sm text-gray-400">{description}</div>
                    {key === 'canViewAllJobs' && (
                      <div className="mt-2 text-xs text-blue-400 font-semibold">
                        ⚠️ Ovo je najvažnija opcija! Kontroliše da li radnik vidi sve ili samo svoje poslove.
                      </div>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Otkaži
            </button>
            <button
              onClick={() => handleUpdatePermissions(worker._id, permissions)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sačuvaj dozvole
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-4">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="h-8 w-8" />
          Upravljanje korisnicima i dozvolama
        </h1>
        <p className="text-gray-400 mt-2">
          Omogućite pristup radnicima i podesite njihove dozvole
        </p>
      </div>

      {/* Workers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers?.map((worker) => (
          <div key={worker._id} className="bg-gray-800 rounded-lg p-4 shadow-lg">
            {/* Worker Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {worker.firstName?.charAt(0)}{worker.lastName?.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{worker.firstName} {worker.lastName}</h3>
                <p className="text-sm text-gray-400">{worker.email}</p>
              </div>
              {worker.hasAccess ? (
                <Unlock className="h-5 w-5 text-green-400" />
              ) : (
                <Lock className="h-5 w-5 text-red-400" />
              )}
            </div>

            {/* Access Status */}
            <div className="mb-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                worker.hasAccess 
                  ? 'bg-green-900/50 text-green-400' 
                  : 'bg-red-900/50 text-red-400'
              }`}>
                {worker.hasAccess ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Pristup omogućen
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Nema pristup
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedWorker(worker);
                  setShowPasswordModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Key className="h-4 w-4" />
                {worker.password ? 'Promeni lozinku' : 'Postavi lozinku'}
              </button>

              <button
                onClick={() => handleToggleAccess(worker._id, worker.hasAccess)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded transition-colors ${
                  worker.hasAccess
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {worker.hasAccess ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Onemogući pristup
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    Omogući pristup
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setSelectedWorker(worker);
                  setShowPermissionsModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Podesi dozvole
              </button>
            </div>

            {/* Current Permissions Preview */}
            {worker.hasAccess && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Trenutne dozvole:</p>
                <div className="flex flex-wrap gap-1">
                  {worker.permissions?.canViewAllJobs && (
                    <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded">Svi poslovi</span>
                  )}
                  {worker.permissions?.canEditJobs && (
                    <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">Edit</span>
                  )}
                  {worker.permissions?.canViewClients && (
                    <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded">Klijenti</span>
                  )}
                  {!worker.permissions?.canViewAllJobs && !worker.permissions?.canEditJobs && !worker.permissions?.canViewClients && (
                    <span className="text-xs text-gray-500">Samo dodeljeni poslovi</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Password Modal */}
      {showPasswordModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="h-6 w-6" />
                Postavi lozinku
              </h2>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-300 mb-2">Radnik: {selectedWorker.firstName} {selectedWorker.lastName}</p>
              <p className="text-gray-400 text-sm mb-4">Email za prijavu: {selectedWorker.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nova lozinka</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white pr-10"
                    placeholder="Minimum 6 karaktera"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Potvrdi lozinku</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="Ponovi lozinku"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Otkaži
              </button>
              <button
                onClick={() => handleSetPassword(selectedWorker._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Postavi lozinku
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedWorker && (
        <PermissionsModal 
          worker={selectedWorker} 
          onClose={() => setShowPermissionsModal(false)} 
        />
      )}
    </div>
  );
};

export default UserManagementView;

