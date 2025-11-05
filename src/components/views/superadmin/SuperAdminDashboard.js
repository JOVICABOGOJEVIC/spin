import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Bell,
  Send,
  CheckCircle,
  XCircle,
  Activity,
  Building2,
  UserPlus,
  Shield
} from 'lucide-react';
import {
  getSuperAdminStats,
  getAllCompanies,
  sendGlobalNotification,
  getSentNotifications,
  createSuperAdmin
} from '../../../redux/api';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    targetAudience: 'all'
  });
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    ownerName: '',
    companyName: '',
    phone: '',
    city: '',
    address: '',
    businessType: 'Home Appliance Technician'
  });

  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.result?.role === 'superadmin';

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error('Nemate pristup ovoj stranici');
      return;
    }

    fetchData();
  }, [isSuperAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, companiesResponse, notificationsResponse] = await Promise.all([
        getSuperAdminStats(),
        getAllCompanies(),
        getSentNotifications()
      ]);

      setStats(statsResponse.data);
      setCompanies(companiesResponse.data);
      setSentNotifications(notificationsResponse.data || []);
    } catch (error) {
      console.error('Error fetching super admin data:', error);
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Naslov i poruka su obavezni');
      return;
    }

    try {
      setSendingNotification(true);
      await sendGlobalNotification(notificationForm);
      toast.success('Obaveštenje je uspešno poslato');
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        targetAudience: 'all'
      });
      setShowNotificationForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Greška pri slanju obaveštenja');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleChange = (e) => {
    setNotificationForm({
      ...notificationForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminFormChange = (e) => {
    setAdminForm({
      ...adminForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!adminForm.email || !adminForm.password) {
      toast.error('Email i password su obavezni');
      return;
    }

    if (adminForm.password.length < 6) {
      toast.error('Password mora biti najmanje 6 karaktera');
      return;
    }

    if (adminForm.password !== adminForm.confirmPassword) {
      toast.error('Passwordi se ne poklapaju');
      return;
    }

    try {
      setCreatingAdmin(true);
      const { confirmPassword, ...adminData } = adminForm;
      await createSuperAdmin(adminData);
      toast.success('Super admin nalog je uspešno kreiran');
      setAdminForm({
        email: '',
        password: '',
        confirmPassword: '',
        ownerName: '',
        companyName: '',
        phone: '',
        city: '',
        address: '',
        businessType: 'Home Appliance Technician'
      });
      setShowCreateAdminForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.response?.data?.message || 'Greška pri kreiranju naloga');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD'
    }).format(amount || 0);
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Nemate pristup ovoj stranici</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-400">Pregled svih korisnika i preplata</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Ukupno kompanija</h3>
            <p className="text-2xl font-bold text-white">{stats?.totalCompanies || 0}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Sa preplatama</h3>
            <p className="text-2xl font-bold text-white">{stats?.companiesWithSubscription || 0}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Bez preplata</h3>
            <p className="text-2xl font-bold text-white">{stats?.companiesWithoutSubscription || 0}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Ukupan prihod</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalRevenue || 0)}</p>
          </div>
        </div>

        {/* Package Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Besplatni paket</h3>
            <p className="text-3xl font-bold text-white">{stats?.packageBreakdown?.free || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Standardni paket</h3>
            <p className="text-3xl font-bold text-blue-500">{stats?.packageBreakdown?.standard || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Biznis paket</h3>
            <p className="text-3xl font-bold text-purple-500">{stats?.packageBreakdown?.business || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Premium paket</h3>
            <p className="text-3xl font-bold text-yellow-500">{stats?.packageBreakdown?.premium || 0}</p>
          </div>
        </div>

        {/* Create Super Admin Section */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <h2 className="text-xl font-bold text-white">Kreiranje Super Admin naloga</h2>
            </div>
            <button
              onClick={() => setShowCreateAdminForm(!showCreateAdminForm)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {showCreateAdminForm ? 'Otkaži' : 'Kreiraj Super Admin'}
            </button>
          </div>

          {showCreateAdminForm && (
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={adminForm.email}
                    onChange={handleAdminFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ime vlasnika
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={adminForm.ownerName}
                    onChange={handleAdminFormChange}
                    placeholder="Super Admin"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={adminForm.password}
                    onChange={handleAdminFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Potvrdi Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={adminForm.confirmPassword}
                    onChange={handleAdminFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ime kompanije
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={adminForm.companyName}
                    onChange={handleAdminFormChange}
                    placeholder="SpinTasker Admin"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={adminForm.phone}
                    onChange={handleAdminFormChange}
                    placeholder="+381601234567"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Grad
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={adminForm.city}
                    onChange={handleAdminFormChange}
                    placeholder="Beograd"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Adresa
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={adminForm.address}
                    onChange={handleAdminFormChange}
                    placeholder="N/A"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tip biznisa
                  </label>
                  <select
                    name="businessType"
                    value={adminForm.businessType}
                    onChange={handleAdminFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Home Appliance Technician">Home Appliance Technician</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Auto Mechanic">Auto Mechanic</option>
                    <option value="Elevator Technician">Elevator Technician</option>
                    <option value="HVAC Technician">HVAC Technician</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Locksmith">Locksmith</option>
                    <option value="Tile Installer">Tile Installer</option>
                    <option value="Painter">Painter</option>
                    <option value="Facade Specialist">Facade Specialist</option>
                    <option value="IT Technician">IT Technician</option>
                    <option value="Handyman">Handyman</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingAdmin}
                className="w-full sm:w-auto px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {creatingAdmin ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Kreiranje...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Kreiraj Super Admin nalog
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Send Notification Section */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-white">Slanje obaveštenja</h2>
            </div>
            <button
              onClick={() => setShowNotificationForm(!showNotificationForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {showNotificationForm ? 'Otkaži' : 'Pošalji obaveštenje'}
            </button>
          </div>

          {showNotificationForm && (
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Naslov
                </label>
                <input
                  type="text"
                  name="title"
                  value={notificationForm.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Poruka
                </label>
                <textarea
                  name="message"
                  value={notificationForm.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tip
                  </label>
                  <select
                    name="type"
                    value={notificationForm.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="success">Uspeh</option>
                    <option value="warning">Upozorenje</option>
                    <option value="error">Greška</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Prioritet
                  </label>
                  <select
                    name="priority"
                    value={notificationForm.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Nizak</option>
                    <option value="medium">Srednji</option>
                    <option value="high">Visok</option>
                    <option value="urgent">Hitno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ciljana grupa
                  </label>
                  <select
                    name="targetAudience"
                    value={notificationForm.targetAudience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Svi korisnici</option>
                    <option value="subscribers">Preplatnici</option>
                    <option value="free">Besplatni paket</option>
                    <option value="standard">Standardni paket</option>
                    <option value="business">Biznis paket</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingNotification}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {sendingNotification ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Šalje se...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Pošalji obaveštenje
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Companies List */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Lista kompanija</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Kompanija</th>
                  <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Email</th>
                  <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Paket</th>
                  <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Cena</th>
                  <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Datum registracije</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-2 text-white">{company.companyName}</td>
                    <td className="py-3 px-2 text-gray-300">{company.email}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        company.subscriptionPackage === 'free' ? 'bg-gray-600 text-gray-300' :
                        company.subscriptionPackage === 'standard' ? 'bg-blue-600 text-white' :
                        'bg-purple-600 text-white'
                      }`}>
                        {company.subscriptionPackage === 'free' ? 'Besplatni' :
                         company.subscriptionPackage === 'standard' ? 'Standardni' :
                         'Biznis'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-white">{formatCurrency(company.subscriptionPrice || 0)}</td>
                    <td className="py-3 px-2">
                      {company.subscriptionActive ? (
                        <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">Aktivan</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">Neaktivan</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-gray-300">
                      {company.createdAt ? new Date(company.createdAt).toLocaleDateString('sr-RS') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sent Notifications */}
        {sentNotifications.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mt-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-white">Poslata obaveštenja</h2>
            </div>
            <div className="space-y-3">
              {sentNotifications.slice(0, 5).map((notification) => (
                <div key={notification._id} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{notification.title}</h3>
                      <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          notification.type === 'info' ? 'bg-blue-600' :
                          notification.type === 'success' ? 'bg-green-600' :
                          notification.type === 'warning' ? 'bg-yellow-600' :
                          'bg-red-600'
                        } text-white`}>
                          {notification.type}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(notification.createdAt).toLocaleString('sr-RS')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

