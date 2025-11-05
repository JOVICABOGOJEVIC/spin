import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  getJobs, 
} from '../../redux/features/jobSlice';
import { getWorkers } from '../../redux/features/workerSlice';
import { fetchClientsAsync } from '../../redux/features/clientSlice';
import { 
  ClipboardList, 
  Users, 
  UserCheck, 
  DollarSign, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { getBusinessType } from '../../utils/businessTypeUtils';

const DashboardHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs, loading: jobsLoading } = useSelector((state) => state.job);
  const { workers, loading: workersLoading } = useSelector((state) => state.worker || { workers: [], loading: false });
  const { clients, loading: clientsLoading } = useSelector((state) => state.client || { clients: [], loading: false });
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    totalWorkers: 0,
    activeWorkers: 0,
    totalClients: 0,
    totalRevenue: 0,
    todayJobs: 0
  });

  const businessType = getBusinessType();

  useEffect(() => {
    if (businessType) {
      dispatch(getJobs(businessType));
    }
    dispatch(getWorkers());
    dispatch(fetchClientsAsync());
  }, [dispatch, businessType]);

  useEffect(() => {
    if (jobs && workers && clients) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeJobs = jobs.filter(job => 
        job.status !== 'Completed' && job.status !== 'Cancelled'
      ).length;

      const completedJobs = jobs.filter(job => 
        job.status === 'Completed'
      ).length;

      const pendingJobs = jobs.filter(job => 
        job.status === 'In Pending' || job.status === 'Received'
      ).length;

      const todayJobs = jobs.filter(job => {
        if (!job.serviceDate) return false;
        const jobDate = new Date(job.serviceDate);
        jobDate.setHours(0, 0, 0, 0);
        return jobDate.getTime() === today.getTime();
      }).length;

      const totalRevenue = jobs
        .filter(job => job.status === 'Completed')
        .reduce((sum, job) => sum + (job.totalAmount || 0), 0);

      const activeWorkers = workers.filter(worker => 
        worker.status === 'active' || worker.status === 'available'
      ).length;

      setStats({
        activeJobs,
        completedJobs,
        pendingJobs,
        totalWorkers: workers.length,
        activeWorkers,
        totalClients: clients.length,
        totalRevenue,
        todayJobs
      });
    }
  }, [jobs, workers, clients]);

  const recentJobs = jobs
    ?.filter(job => job.status !== 'Completed' && job.status !== 'Cancelled')
    .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
    .slice(0, 5) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
      case 'In Repair':
      case 'Diagnosing':
        return 'bg-blue-100 text-blue-800';
      case 'In Pending':
      case 'Received':
        return 'bg-yellow-100 text-yellow-800';
      case 'On Road':
      case 'At Client':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'In Pending':
      case 'Received':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color = "blue", onClick }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700"
    };

    return (
      <div 
        onClick={onClick}
        className={`${colorClasses[color]} border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={`p-3 rounded-lg bg-white`}>
            {icon}
          </div>
          {onClick && (
            <ArrowRight className="w-5 h-5 opacity-50" />
          )}
        </div>
        <h3 className="text-sm font-medium opacity-75 mb-1">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs mt-2 opacity-60">{subtitle}</p>
        )}
      </div>
    );
  };

  const QuickActionButton = ({ icon, label, onClick, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500 hover:bg-blue-600",
      green: "bg-green-500 hover:bg-green-600",
      purple: "bg-purple-500 hover:bg-purple-600"
    };

    return (
      <button
        onClick={onClick}
        className={`${colorClasses[color]} text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm hover:shadow-md`}
      >
        {icon}
        {label}
      </button>
    );
  };

  const loading = jobsLoading || workersLoading || clientsLoading;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dobrodošli, {user?.result?.companyName || user?.result?.firstName || 'Korisnik'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Pregled vašeg poslovanja
          </p>
        </div>
        <div className="flex gap-3">
          <QuickActionButton
            icon={<Plus className="w-5 h-5" />}
            label="Novi Posao"
            onClick={() => navigate('/dashboard/jobs/new')}
            color="blue"
          />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList className="w-6 h-6" />}
          title="Aktivni Poslovi"
          value={stats.activeJobs}
          subtitle={`${stats.todayJobs} danas`}
          color="blue"
          onClick={() => navigate('/dashboard/jobs')}
        />
        <StatCard
          icon={<UserCheck className="w-6 h-6" />}
          title="Radnici"
          value={stats.totalWorkers}
          subtitle={`${stats.activeWorkers} aktivnih`}
          color="green"
          onClick={() => navigate('/dashboard/workers')}
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Klijenti"
          value={stats.totalClients}
          subtitle="Ukupno klijenata"
          color="purple"
          onClick={() => navigate('/dashboard/clients')}
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Ukupan Prihod"
          value={`${stats.totalRevenue.toLocaleString('sr-RS')} RSD`}
          subtitle={`${stats.completedJobs} završenih poslova`}
          color="orange"
        />
      </div>

      {/* Quick Actions & Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Brze Akcije
            </h2>
            <div className="space-y-3">
              <QuickActionButton
                icon={<Plus className="w-4 h-4" />}
                label="Kreiraj Posao"
                onClick={() => navigate('/dashboard/jobs/new')}
                color="blue"
              />
              <QuickActionButton
                icon={<Users className="w-4 h-4" />}
                label="Dodaj Klijenta"
                onClick={() => navigate('/dashboard/clients/new')}
                color="green"
              />
              <QuickActionButton
                icon={<UserCheck className="w-4 h-4" />}
                label="Dodaj Radnika"
                onClick={() => navigate('/dashboard/workers/new')}
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Nedavni Poslovi
              </h2>
              <button
                onClick={() => navigate('/dashboard/jobs')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Vidi sve
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Učitavanje...
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nemate aktivnih poslova</p>
                <button
                  onClick={() => navigate('/dashboard/jobs/new')}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Kreiraj prvi posao
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/dashboard/jobs/${job._id}`)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {job.clientName || job.client?.name || 'N/A'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          {job.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {job.description || job.issue || 'Bez opisa'}
                      </p>
                      {job.serviceDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(job.serviceDate).toLocaleDateString('sr-RS')}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Završeni Poslovi</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedJobs}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Poslovi na Čekanju</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingJobs}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Poslovi Danas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayJobs}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
