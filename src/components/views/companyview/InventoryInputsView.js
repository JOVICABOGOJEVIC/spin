import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  Package, Plus, Search, Calendar, FileText, X, ArrowDown 
} from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import {
  getInventoryItems,
  getWarehouseTransactions,
  createInputTransaction,
  getTransactionsByJob,
  getJobs
} from '../../../redux/api';
import { getBusinessType } from '../../../utils/businessTypeUtils';

const InventoryInputsView = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: 0,
    unitPrice: 0,
    documentNumber: '',
    documentDate: new Date().toISOString().split('T')[0],
    vatRate: 20,
    customsAmount: 0,
    customsRate: 0,
    landedCost: 0,
    partnerName: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const businessType = getBusinessType();
      const [itemsRes, transactionsRes, jobsRes] = await Promise.all([
        getInventoryItems(),
        getWarehouseTransactions({ type: 'INPUT', ...dateFilter }),
        businessType ? getJobs(businessType) : Promise.resolve({ data: [] })
      ]);
      setItems(itemsRes.data || []);
      setTransactions(transactionsRes.data || []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInputTransaction(formData);
      toast.success('Ulaz robe je registrovan');
      setShowForm(false);
      setFormData({
        itemId: '',
        quantity: 0,
        unitPrice: 0,
        documentNumber: '',
        documentDate: new Date().toISOString().split('T')[0],
        vatRate: 20,
        customsAmount: 0,
        customsRate: 0,
        landedCost: 0,
        partnerName: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri čuvanju ulaza');
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.itemId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.partnerName?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <ArrowDown className="h-6 w-6" />
                {t('inventory.inputs.title', 'Ulazi robe')}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {t('inventory.inputs.subtitle', 'Registracija ulaza robe u magacin')}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="h-5 w-5" />
              {t('inventory.inputs.addInput', 'Dodaj ulaz')}
            </button>
          </div>

          {/* Filters */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('inventory.inputs.search', 'Pretraži ulaze...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  {t('common.startDate', 'Datum od')}
                </label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  {t('common.endDate', 'Datum do')}
                </label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {t('inventory.inputs.newInput', 'Novi ulaz robe')}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {items.map(item => (
                      <option key={item._id} value={item._id}>
                        {item.itemCode} - {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.inputs.documentNumber', 'Broj dokumenta')} *
                  </label>
                  <input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.inputs.documentDate', 'Datum dokumenta')} *
                  </label>
                  <input
                    type="date"
                    name="documentDate"
                    value={formData.documentDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  {selectedItem && (
                    <span className="text-xs text-gray-400 mt-1">{selectedItem.unit}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.inputs.unitPrice', 'Jedinična cena')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.vatRate', 'PDV stopa (%)')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="vatRate"
                    value={formData.vatRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.inputs.partnerName', 'Dobavljač')}
                  </label>
                  <input
                    type="text"
                    name="partnerName"
                    value={formData.partnerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.inputs.landedCost', 'Troškovi nabavke')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="landedCost"
                    value={formData.landedCost}
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
                  {t('common.save', 'Sačuvaj')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.inputs.documentNumber', 'Broj dokumenta')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.inputs.documentDate', 'Datum')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.name', 'Artikal')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.quantity', 'Količina')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.inputs.unitPrice', 'Cena')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.inputs.totalValue', 'Ukupno')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.inputs.partnerName', 'Dobavljač')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                      {t('inventory.inputs.noInputs', 'Nema ulaza robe')}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-white">{transaction.documentNumber}</td>
                      <td className="px-4 py-3 text-sm text-white">
                        {new Date(transaction.documentDate).toLocaleDateString('sr-RS')}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {transaction.itemId?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {transaction.quantity} {transaction.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(transaction.unitPrice || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(transaction.totalValue || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {transaction.partnerName || '-'}
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

export default InventoryInputsView;

