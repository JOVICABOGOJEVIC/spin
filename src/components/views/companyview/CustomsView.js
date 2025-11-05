import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  FileText, Plus, Search, Trash2, Edit, X, Calculator 
} from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import {
  getCustomsDeclarations,
  createCustomsDeclaration,
  updateCustomsDeclaration,
  deleteCustomsDeclaration,
  getCustomsDeclaration
} from '../../../redux/api';

const CustomsView = () => {
  const { t } = useTranslation();
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeclaration, setEditingDeclaration] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    declarationNumber: '',
    declarationDate: new Date().toISOString().split('T')[0],
    customsOffice: '',
    totalInvoiceValue: 0,
    currency: 'EUR',
    exchangeRate: 1,
    freightCost: 0,
    insuranceCost: 0,
    otherCosts: 0,
    customsDutyRate: 0,
    vatRate: 20,
    supplierName: '',
    supplierAddress: '',
    supplierCountry: '',
    importerName: '',
    importerAddress: '',
    importerPIB: '',
    invoiceNumber: '',
    invoiceDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchDeclarations();
  }, [dateFilter, statusFilter]);

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
      // Note: Backend doesn't support filtering yet, but we can filter on frontend
      const response = await getCustomsDeclarations();
      let filtered = response.data || [];
      
      // Frontend filtering
      if (dateFilter.startDate || dateFilter.endDate) {
        filtered = filtered.filter(d => {
          const declDate = new Date(d.declarationDate);
          if (dateFilter.startDate && declDate < new Date(dateFilter.startDate)) return false;
          if (dateFilter.endDate && declDate > new Date(dateFilter.endDate)) return false;
          return true;
        });
      }
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(d => d.status === statusFilter);
      }
      
      setDeclarations(filtered);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri učitavanju deklaracija');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const numValue = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const calculateTotals = () => {
    const {
      totalInvoiceValue,
      exchangeRate,
      freightCost,
      insuranceCost,
      otherCosts,
      customsDutyRate,
      vatRate
    } = formData;

    const totalLandedCost = totalInvoiceValue + freightCost + insuranceCost + otherCosts;
    const customsBasis = totalLandedCost * exchangeRate;
    const customsDuty = customsBasis * (customsDutyRate / 100);
    const vatBasis = customsBasis + customsDuty;
    const vatAmount = vatBasis * (vatRate / 100);
    const totalAmount = customsDuty + vatAmount;

    return {
      totalLandedCost,
      customsBasis,
      customsDuty,
      vatBasis,
      vatAmount,
      totalAmount
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totals = calculateTotals();
      const dataToSubmit = {
        ...formData,
        ...totals
      };

      if (editingDeclaration) {
        await updateCustomsDeclaration({ id: editingDeclaration._id, declarationData: dataToSubmit });
        toast.success('Carinska deklaracija je ažurirana');
      } else {
        await createCustomsDeclaration(dataToSubmit);
        toast.success('Carinska deklaracija je kreirana');
      }
      setShowForm(false);
      setEditingDeclaration(null);
      resetForm();
      fetchDeclarations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri čuvanju deklaracije');
    }
  };

  const resetForm = () => {
    setFormData({
      declarationNumber: '',
      declarationDate: new Date().toISOString().split('T')[0],
      customsOffice: '',
      totalInvoiceValue: 0,
      currency: 'EUR',
      exchangeRate: 1,
      freightCost: 0,
      insuranceCost: 0,
      otherCosts: 0,
      customsDutyRate: 0,
      vatRate: 20,
      supplierName: '',
      supplierAddress: '',
      supplierCountry: '',
      importerName: '',
      importerAddress: '',
      importerPIB: '',
      invoiceNumber: '',
      invoiceDate: '',
      notes: ''
    });
  };

  const handleEdit = async (id) => {
    try {
      const response = await getCustomsDeclaration(id);
      const declaration = response.data;
      setEditingDeclaration(declaration);
      setFormData({
        declarationNumber: declaration.declarationNumber,
        declarationDate: new Date(declaration.declarationDate).toISOString().split('T')[0],
        customsOffice: declaration.customsOffice || '',
        totalInvoiceValue: declaration.totalInvoiceValue,
        currency: declaration.currency || 'EUR',
        exchangeRate: declaration.exchangeRate || 1,
        freightCost: declaration.freightCost || 0,
        insuranceCost: declaration.insuranceCost || 0,
        otherCosts: declaration.otherCosts || 0,
        customsDutyRate: declaration.customsDutyRate || 0,
        vatRate: declaration.vatRate || 20,
        supplierName: declaration.supplierName || '',
        supplierAddress: declaration.supplierAddress || '',
        supplierCountry: declaration.supplierCountry || '',
        importerName: declaration.importerName || '',
        importerAddress: declaration.importerAddress || '',
        importerPIB: declaration.importerPIB || '',
        invoiceNumber: declaration.invoiceNumber || '',
        invoiceDate: declaration.invoiceDate ? new Date(declaration.invoiceDate).toISOString().split('T')[0] : '',
        notes: declaration.notes || ''
      });
      setShowForm(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri učitavanju deklaracije');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovu carinsku deklaraciju?')) {
      return;
    }
    try {
      await deleteCustomsDeclaration(id);
      toast.success('Carinska deklaracija je obrisana');
      fetchDeclarations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri brisanju deklaracije');
    }
  };

  const filteredDeclarations = declarations.filter(d =>
    d.declarationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.importerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = calculateTotals();

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
                <FileText className="h-6 w-6" />
                {t('inventory.customs.title', 'Carina')}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {t('inventory.customs.subtitle', 'Upravljanje carinskim deklaracijama')}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingDeclaration(null);
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="h-5 w-5" />
              {t('inventory.customs.addDeclaration', 'Dodaj deklaraciju')}
            </button>
          </div>

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('inventory.customs.search', 'Pretraži deklaracije...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingDeclaration ? t('inventory.customs.editDeclaration', 'Izmeni deklaraciju') : t('inventory.customs.newDeclaration', 'Nova deklaracija')}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingDeclaration(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.customs.declarationNumber', 'Broj deklaracije')} *
                  </label>
                  <input
                    type="text"
                    name="declarationNumber"
                    value={formData.declarationNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.customs.declarationDate', 'Datum deklaracije')} *
                  </label>
                  <input
                    type="date"
                    name="declarationDate"
                    value={formData.declarationDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.customs.totalInvoiceValue', 'Fakturisana vrednost')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="totalInvoiceValue"
                    value={formData.totalInvoiceValue}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.customs.currency', 'Valuta')}
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="RSD">RSD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.customs.exchangeRate', 'Kurs')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="exchangeRate"
                    value={formData.exchangeRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.customs.customsDutyRate', 'Carinska stopa (%)')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="customsDutyRate"
                    value={formData.customsDutyRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.customs.vatRate', 'PDV stopa (%)')}
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
              </div>

              {/* Calculated Totals */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-5 w-5 text-blue-400" />
                  <h3 className="font-medium text-white">{t('inventory.customs.calculations', 'Kalkulacije')}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400">{t('inventory.customs.customsDuty', 'Carina')}</div>
                    <div className="text-white font-medium">{new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(totals.customsDuty || 0)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">{t('inventory.customs.vatAmount', 'PDV')}</div>
                    <div className="text-white font-medium">{new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(totals.vatAmount || 0)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">{t('inventory.customs.totalAmount', 'Ukupno')}</div>
                    <div className="text-white font-bold text-lg">{new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(totals.totalAmount || 0)}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDeclaration(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  {t('common.cancel', 'Otkaži')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {editingDeclaration ? t('common.save', 'Sačuvaj') : t('common.create', 'Kreiraj')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Declarations List */}
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.customs.declarationNumber', 'Broj')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.customs.declarationDate', 'Datum')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.customs.totalInvoiceValue', 'Vrednost')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.customs.customsDuty', 'Carina')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.customs.vatAmount', 'PDV')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.customs.totalAmount', 'Ukupno')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('common.actions', 'Akcije')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredDeclarations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                      {t('inventory.customs.noDeclarations', 'Nema deklaracija')}
                    </td>
                  </tr>
                ) : (
                  filteredDeclarations.map((declaration) => (
                    <tr key={declaration._id} className="hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-white">{declaration.declarationNumber}</td>
                      <td className="px-4 py-3 text-sm text-white">
                        {new Date(declaration.declarationDate).toLocaleDateString('sr-RS')}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: declaration.currency || 'EUR' }).format(declaration.totalInvoiceValue || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(declaration.customsDuty || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(declaration.vatAmount || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-bold">
                        {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(declaration.totalAmount || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(declaration._id)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(declaration._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

export default CustomsView;

