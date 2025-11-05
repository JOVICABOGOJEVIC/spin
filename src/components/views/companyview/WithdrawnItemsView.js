import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  Package, Search, ClipboardList, X 
} from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import {
  getWithdrawnItems,
  reserveItemForJob,
  issueReservedItem,
  returnItem,
  getInventoryItems,
  getWithdrawnItemsStats,
  getJobs
} from '../../../redux/api';
import { getBusinessType } from '../../../utils/businessTypeUtils';

const WithdrawnItemsView = () => {
  const { t } = useTranslation();
  const [movements, setMovements] = useState([]);
  const [items, setItems] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    jobId: '',
    itemId: '',
    quantity: 0,
    unitSellingPrice: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const businessType = getBusinessType();
      const [movementsRes, itemsRes, statsRes, jobsRes] = await Promise.all([
        getWithdrawnItems({ status: statusFilter !== 'all' ? statusFilter : undefined }),
        getInventoryItems(),
        getWithdrawnItemsStats(),
        businessType ? getJobs(businessType) : Promise.resolve({ data: [] })
      ]);
      setMovements(movementsRes.data || []);
      setItems(itemsRes.data || []);
      setStats(statsRes.data);
      setJobs(jobsRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    try {
      await reserveItemForJob(formData);
      toast.success('Artikal je rezervisan');
      setShowForm(false);
      setFormData({
        jobId: '',
        itemId: '',
        quantity: 0,
        unitSellingPrice: 0,
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri rezervaciji');
    }
  };

  const handleIssue = async (movementId) => {
    try {
      await issueReservedItem(movementId, {});
      toast.success('Artikal je izdat');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri izdavanju');
    }
  };

  const handleReturn = async (movementId, quantity) => {
    try {
      await returnItem(movementId, { quantity });
      toast.success('Artikal je vraćen');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri vraćanju');
    }
  };

  const filteredMovements = movements.filter(m =>
    m.itemId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.jobId?.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItem = items.find(item => item._id === formData.itemId);

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="h-6 w-6" />
                {t('inventory.withdrawn.title', 'Povučena roba')}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {t('inventory.withdrawn.subtitle', 'Roba povučena iz magacina za poslove')}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Package className="h-5 w-5" />
              {t('inventory.withdrawn.reserve', 'Rezerviši')}
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">{t('inventory.withdrawn.reserved', 'Rezervisano')}</div>
                <div className="text-2xl font-bold text-yellow-400 mt-1">{stats.totalReserved || 0}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">{t('inventory.withdrawn.issued', 'Izdata')}</div>
                <div className="text-2xl font-bold text-green-400 mt-1">{stats.totalIssued || 0}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">{t('inventory.withdrawn.totalCost', 'Ukupni trošak')}</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(stats.totalCost || 0)}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">{t('inventory.withdrawn.totalMargin', 'Ukupna marža')}</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">
                  {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(stats.totalMargin || 0)}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('inventory.withdrawn.search', 'Pretraži...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                {t('inventory.withdrawn.filterStatus', 'Filter po statusu')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('jobs.all', 'Svi')}</option>
                <option value="RESERVED">{t('inventory.withdrawn.reserved', 'Rezervisano')}</option>
                <option value="ISSUED">{t('inventory.withdrawn.issued', 'Izdata')}</option>
                <option value="RETURNED">{t('inventory.withdrawn.returned', 'Vraćeno')}</option>
                <option value="USED">{t('inventory.withdrawn.used', 'Iskorišćeno')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {t('inventory.withdrawn.reserveItem', 'Rezerviši artikal')}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleReserve} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('jobs.job', 'Posao')} *
                  </label>
                  <select
                    name="jobId"
                    value={formData.jobId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('common.select', 'Izaberi posao...')}</option>
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>
                        {job.clientName} - {job.issueDescription?.substring(0, 50)}... ({new Date(job.serviceDate || job.createdAt).toLocaleDateString('sr-RS')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.name', 'Artikal')} *
                  </label>
                  <select
                    name="itemId"
                    value={formData.itemId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('common.select', 'Izaberi...')}</option>
                    {items.filter(item => item.availableQuantity > 0).map(item => (
                      <option key={item._id} value={item._id}>
                        {item.itemCode} - {item.name} (Dostupno: {item.availableQuantity} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.quantity', 'Količina')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.sellingPrice', 'Prodajna cena')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="unitSellingPrice"
                    value={formData.unitSellingPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('common.notes', 'Napomene')}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  {t('common.cancel', 'Otkaži')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {t('inventory.withdrawn.reserve', 'Rezerviši')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Movements List */}
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.name', 'Artikal')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('jobs.client', 'Klijent')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.quantity', 'Količina')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.withdrawn.status', 'Status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.withdrawn.totalCost', 'Trošak')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('common.actions', 'Akcije')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                      {t('inventory.withdrawn.noMovements', 'Nema povučene robe')}
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((movement) => (
                    <tr key={movement._id} className="hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-white">
                        {movement.itemId?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {movement.jobId?.clientName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {movement.quantity} {movement.unit}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          movement.status === 'ISSUED' ? 'bg-green-900 text-green-300' :
                          movement.status === 'RESERVED' ? 'bg-yellow-900 text-yellow-300' :
                          movement.status === 'RETURNED' ? 'bg-blue-900 text-blue-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {movement.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(movement.totalCost || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          {movement.status === 'RESERVED' && (
                            <button
                              onClick={() => handleIssue(movement._id)}
                              className="text-green-400 hover:text-green-300 text-xs"
                            >
                              {t('inventory.withdrawn.issue', 'Izdaј')}
                            </button>
                          )}
                          {(movement.status === 'ISSUED' || movement.status === 'RESERVED') && (
                            <button
                              onClick={() => handleReturn(movement._id, movement.quantity)}
                              className="text-blue-400 hover:text-blue-300 text-xs"
                            >
                              {t('inventory.withdrawn.return', 'Vrati')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawnItemsView;

