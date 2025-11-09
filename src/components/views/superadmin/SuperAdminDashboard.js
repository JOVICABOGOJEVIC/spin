import React, { useEffect, useMemo, useState } from 'react';
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
  Shield,
  Sparkles,
  ListChecks,
  PenLine,
  Trash2
} from 'lucide-react';
import {
  getSuperAdminStats,
  getAllCompanies,
  sendGlobalNotification,
  getSentNotifications,
  createSuperAdmin,
  fetchAIBusinessIdeas,
  createAIBusinessIdea,
  updateAIBusinessIdea,
  deleteAIBusinessIdea
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
  const [aiIdeas, setAIIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [savingIdea, setSavingIdea] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState(null);
  const [ideaForm, setIdeaForm] = useState({
    title: '',
    phase: 'Strategija',
    summary: '',
    actionsText: '',
    aiAssist: '',
    impact: '',
    resources: '',
    tags: '',
  });
  const phaseOptions = [
    'Strategija',
    'Marketinške aktivnosti',
    'Prodaja',
    'Operativa',
    'Automatizacija',
    'Analitika',
    'Ostalo',
  ];

  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.result?.role === 'superadmin';

  const refreshIdeas = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setIdeasLoading(true);
      }
      const ideasResponse = await fetchAIBusinessIdeas();
      setAIIdeas(Array.isArray(ideasResponse?.data) ? ideasResponse.data : []);
    } catch (error) {
      console.error('Error fetching AI business ideas:', error);
      toast.error('Greška pri učitavanju AI biznis ideja');
    } finally {
      if (showSpinner) {
        setIdeasLoading(false);
      }
    }
  };

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
      await refreshIdeas(false);
    } catch (error) {
      console.error('Error fetching super admin data:', error);
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
      setIdeasLoading(false);
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

  const resetIdeaForm = () => {
    setIdeaForm({
      title: '',
      phase: 'Strategija',
      summary: '',
      actionsText: '',
      aiAssist: '',
      impact: '',
      resources: '',
      tags: '',
    });
    setEditingIdeaId(null);
  };

  const handleIdeaFormChange = (event) => {
    const { name, value } = event.target;
    setIdeaForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIdeaEdit = (idea) => {
    setIdeaForm({
      title: idea.title || '',
      phase: idea.phase || 'Strategija',
      summary: idea.summary || '',
      actionsText: Array.isArray(idea.actionSteps) ? idea.actionSteps.join('\n') : '',
      aiAssist: idea.aiAssist || '',
      impact: idea.impact || '',
      resources: idea.resources || '',
      tags: Array.isArray(idea.tags) ? idea.tags.join(', ') : '',
    });
    setEditingIdeaId(idea.id);
  };

  const handleIdeaDelete = async (id) => {
    const confirmDelete = window.confirm('Da li si siguran da želiš da obrišeš ovu ideju?');
    if (!confirmDelete) return;

    try {
      await deleteAIBusinessIdea(id);
      toast.success('AI biznis ideja je obrisana.');
      await refreshIdeas();
    } catch (error) {
      console.error('Error deleting AI business idea:', error);
      toast.error(error.response?.data?.message || 'Greška pri brisanju ideje.');
    }
  };

  const handleIdeaSubmit = async (event) => {
    event.preventDefault();
    if (!ideaForm.title.trim()) {
      toast.error('Naslov ideje je obavezan.');
      return;
    }
    if (!ideaForm.phase.trim()) {
      toast.error('Faza poslovanja je obavezna.');
      return;
    }

    const payload = {
      title: ideaForm.title.trim(),
      phase: ideaForm.phase.trim(),
      summary: ideaForm.summary.trim(),
      actionSteps: ideaForm.actionsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      aiAssist: ideaForm.aiAssist.trim(),
      impact: ideaForm.impact.trim(),
      resources: ideaForm.resources.trim(),
      tags: ideaForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      setSavingIdea(true);
      if (editingIdeaId) {
        await updateAIBusinessIdea({ id: editingIdeaId, ideaData: payload });
        toast.success('AI biznis ideja je ažurirana.');
      } else {
        await createAIBusinessIdea(payload);
        toast.success('AI biznis ideja je dodata.');
      }
      await refreshIdeas();
      resetIdeaForm();
    } catch (error) {
      console.error('Error saving AI business idea:', error);
      toast.error(error.response?.data?.message || 'Greška pri čuvanju ideje.');
    } finally {
      setSavingIdea(false);
    }
  };

  const groupedIdeas = useMemo(() => {
    if (!Array.isArray(aiIdeas) || aiIdeas.length === 0) return [];
    const phaseMap = aiIdeas.reduce((acc, idea) => {
      const phase = idea.phase || 'Druge faze';
      if (!acc[phase]) {
        acc[phase] = [];
      }
      acc[phase].push(idea);
      return acc;
    }, {});

    return Object.entries(phaseMap)
      .map(([phase, items]) => ({
        phase,
        items: items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      }))
      .sort((a, b) => a.phase.localeCompare(b.phase, 'sr', { sensitivity: 'base' }));
  }, [aiIdeas]);

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

        {/* AI Business Ideas Management */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 border border-emerald-600/40 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <div>
                <h2 className="text-xl font-bold text-white">AI Biznis ideje i faze</h2>
                <p className="text-sm text-emerald-100/80">
                  Definiši smernice po fazama i podeli ih sa svim kompanijama. AI asistencija je uključena u svaku ideju.
                </p>
              </div>
            </div>
            {editingIdeaId && (
              <button
                type="button"
                onClick={resetIdeaForm}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Otkaži izmenu
              </button>
            )}
          </div>

          <form onSubmit={handleIdeaSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Naslov ideje *
                </label>
                <input
                  type="text"
                  name="title"
                  value={ideaForm.title}
                  onChange={handleIdeaFormChange}
                  placeholder="npr. Servis veš mašina sa AI dijagnostikom"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Faza poslovanja *
                </label>
                <select
                  name="phase"
                  value={ideaForm.phase}
                  onChange={handleIdeaFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {phaseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Kratki opis / cilj
              </label>
              <textarea
                name="summary"
                value={ideaForm.summary}
                onChange={handleIdeaFormChange}
                rows={2}
                placeholder="Šta je ideja i kakav rezultat očekujemo?"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Koraci za tim (jedan po liniji)
                </label>
                <textarea
                  name="actionsText"
                  value={ideaForm.actionsText}
                  onChange={handleIdeaFormChange}
                  rows={4}
                  placeholder={`1. Analiziraj istoriju servisa\n2. Kreiraj AI ponudu sa cenom\n3. Zakazi termin za testiranje`}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    AI asistencija / alati
                  </label>
                  <textarea
                    name="aiAssist"
                    value={ideaForm.aiAssist}
                    onChange={handleIdeaFormChange}
                    rows={2}
                    placeholder="npr. ChatGPT za skripte, Make.com za automatizaciju e-maila"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Očekivani uticaj
                  </label>
                  <textarea
                    name="impact"
                    value={ideaForm.impact}
                    onChange={handleIdeaFormChange}
                    rows={2}
                    placeholder="npr. +20% upita u prvoj sedmici, manje vremena za ponude"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Resursi / linkovi
                </label>
                <textarea
                  name="resources"
                  value={ideaForm.resources}
                  onChange={handleIdeaFormChange}
                  rows={2}
                  placeholder="Link ka template-u ili treningu"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tagovi (odvojeni zarezom)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={ideaForm.tags}
                  onChange={handleIdeaFormChange}
                  placeholder="marketing, upsell, automatizacija"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="submit"
                disabled={savingIdea}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {savingIdea ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Čuvamo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {editingIdeaId ? 'Sačuvaj izmene' : 'Dodaj AI biznis ideju'}
                  </>
                )}
              </button>
              {!savingIdea && (
                <p className="text-xs text-gray-400">
                  AI smernice se odmah vide u sekciji „AI Biznis“ kod svih kompanija.
                </p>
              )}
            </div>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="h-5 w-5 text-emerald-300" />
              <h3 className="text-lg font-semibold text-white">Postojeće ideje po fazama</h3>
            </div>

            {ideasLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
              </div>
            ) : groupedIdeas.length === 0 ? (
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 text-sm text-gray-300">
                Još uvek nema sačuvanih ideja. Dodaj prvu ideju iznad i kompanije će odmah dobiti smernice.
              </div>
            ) : (
              <div className="space-y-4">
                {groupedIdeas.map(({ phase, items }) => (
                  <div key={phase} className="bg-gray-900/70 border border-gray-700 rounded-xl">
                    <div className="px-4 py-3 border-b border-gray-700 text-sm font-semibold text-emerald-200 uppercase tracking-wide">
                      {phase} ({items.length})
                    </div>
                    <div className="p-4 space-y-3">
                      {items.map((idea) => (
                        <div key={idea.id} className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <h4 className="text-lg font-semibold text-white">{idea.title}</h4>
                              {idea.summary && <p className="text-sm text-gray-300 mt-1">{idea.summary}</p>}
                              <p className="text-[11px] text-gray-500 mt-1">
                                Ažurirano: {idea.updatedAt ? new Date(idea.updatedAt).toLocaleString('sr-RS') : '—'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleIdeaEdit(idea)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors"
                              >
                                <PenLine className="h-4 w-4" />
                                Izmeni
                              </button>
                              <button
                                type="button"
                                onClick={() => handleIdeaDelete(idea.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                Obriši
                              </button>
                            </div>
                          </div>

                          {idea.actionSteps?.length > 0 && (
                            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3">
                              <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Koraci</p>
                              <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
                                {idea.actionSteps.map((step, index) => (
                                  <li key={`${idea.id}-step-${index}`}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {(idea.aiAssist || idea.impact || idea.resources) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-200">
                              {idea.aiAssist && (
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                  <p className="uppercase tracking-wide text-blue-200 font-semibold mb-1">AI asistencija</p>
                                  <p className="leading-relaxed">{idea.aiAssist}</p>
                                </div>
                              )}
                              {idea.impact && (
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                  <p className="uppercase tracking-wide text-purple-200 font-semibold mb-1">Uticaj</p>
                                  <p className="leading-relaxed">{idea.impact}</p>
                                </div>
                              )}
                              {idea.resources && (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                                  <p className="uppercase tracking-wide text-emerald-200 font-semibold mb-1">Resursi</p>
                                  <p className="leading-relaxed">{idea.resources}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {idea.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-[11px] text-gray-300">
                              {idea.tags.map((tag) => (
                                <span key={`${idea.id}-${tag}`} className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-full">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {idea.responsesSummary && (
                            <div className="bg-gray-900/60 border border-emerald-600/40 rounded-lg p-3 space-y-3">
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="inline-flex items-center gap-2 text-emerald-300">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-semibold">
                                    Pokreću: {idea.responsesSummary.acceptedCount}
                                  </span>
                                </div>
                                <div className="inline-flex items-center gap-2 text-red-300">
                                  <XCircle className="h-4 w-4" />
                                  <span className="font-semibold">
                                    Preskaču: {idea.responsesSummary.declinedCount}
                                  </span>
                                </div>
                              </div>

                              {(idea.responsesSummary.accepted.length > 0 ||
                                idea.responsesSummary.declined.length > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-200">
                                  {idea.responsesSummary.accepted.length > 0 && (
                                    <div>
                                      <p className="text-[11px] uppercase tracking-wide text-emerald-300 mb-2">
                                        Kompanije koje pokreću fazu
                                      </p>
                                      <ul className="space-y-1">
                                        {idea.responsesSummary.accepted.map((entry) => (
                                          <li
                                            key={`${idea.id}-accepted-${entry.companyId}`}
                                            className="flex items-center justify-between gap-2 bg-gray-800/70 border border-gray-700 rounded-lg px-3 py-2"
                                          >
                                            <span className="font-medium text-white">{entry.companyName}</span>
                                            <span className="text-[11px] text-gray-400">
                                              {entry.respondedAt
                                                ? new Date(entry.respondedAt).toLocaleString('sr-RS')
                                                : '—'}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {idea.responsesSummary.declined.length > 0 && (
                                    <div>
                                      <p className="text-[11px] uppercase tracking-wide text-red-300 mb-2">
                                        Kompanije koje preskaču
                                      </p>
                                      <ul className="space-y-1">
                                        {idea.responsesSummary.declined.map((entry) => (
                                          <li
                                            key={`${idea.id}-declined-${entry.companyId}`}
                                            className="flex items-center justify-between gap-2 bg-gray-800/70 border border-gray-700 rounded-lg px-3 py-2"
                                          >
                                            <span className="font-medium text-white">{entry.companyName}</span>
                                            <span className="text-[11px] text-gray-400">
                                              {entry.respondedAt
                                                ? new Date(entry.respondedAt).toLocaleString('sr-RS')
                                                : '—'}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

