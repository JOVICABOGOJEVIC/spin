import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  Package, Plus, Edit, Trash2, Search, AlertCircle, 
  TrendingUp, DollarSign, FileText, X 
} from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import {
  getInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStats
} from '../../../redux/api';

const InventoryView = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    itemCode: '',
    name: '',
    description: '',
    category: '',
    unit: 'kom',
    purchasePrice: 0,
    sellingPrice: 0,
    vatRate: 20,
    minQuantity: 0,
    warehouseLocation: '',
    storageSector: '',
    storageBin: '',
    valuationMethod: 'AVERAGE'
  });

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await getInventoryItems();
      setItems(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri učitavanju artikala');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getInventoryStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateInventoryItem({ id: editingItem._id, itemData: formData });
        toast.success('Artikal je ažuriran');
      } else {
        await createInventoryItem(formData);
        toast.success('Artikal je kreiran');
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({
        itemCode: '',
        name: '',
        description: '',
        category: '',
        unit: 'kom',
        purchasePrice: 0,
        sellingPrice: 0,
        vatRate: 20,
        minQuantity: 0,
        warehouseLocation: '',
        storageSector: '',
        storageBin: '',
        valuationMethod: 'AVERAGE'
      });
      fetchItems();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri čuvanju artikla');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode,
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      unit: item.unit,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice || 0,
      vatRate: item.vatRate || 20,
      minQuantity: item.minQuantity || 0,
      warehouseLocation: item.warehouseLocation || '',
      storageSector: item.storageSector || '',
      storageBin: item.storageBin || '',
      valuationMethod: item.valuationMethod || 'AVERAGE'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj artikal?')) {
      return;
    }
    try {
      await deleteInventoryItem(id);
      toast.success('Artikal je obrisan');
      fetchItems();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri brisanju artikla');
    }
  };

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
  
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    const matchesLowStock = !lowStockFilter || 
      (item.currentQuantity <= item.minQuantity && item.minQuantity > 0);
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockItems = items.filter(item => 
    item.currentQuantity <= item.minQuantity && item.minQuantity > 0
  );

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
                <Package className="h-6 w-6" />
                {t('inventory.title', 'Magacin i zaliha')}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {t('inventory.subtitle', 'Pregled i upravljanje zalihama robe u magacinu')}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  itemCode: '',
                  name: '',
                  description: '',
                  category: '',
                  unit: 'kom',
                  purchasePrice: 0,
                  sellingPrice: 0,
                  vatRate: 20,
                  minQuantity: 0,
                  warehouseLocation: '',
                  storageSector: '',
                  storageBin: '',
                  valuationMethod: 'AVERAGE'
                });
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="h-5 w-5" />
              {t('inventory.addItem', 'Dodaj artikal')}
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">{t('inventory.totalItems', 'Ukupno artikala')}</div>
                <div className="text-2xl font-bold text-white mt-1">{stats.totalItems || 0}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">{t('inventory.totalValue', 'Ukupna vrednost')}</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(stats.totalValue || 0)}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">{t('inventory.totalQuantity', 'Ukupna količina')}</div>
                <div className="text-2xl font-bold text-white mt-1">{stats.totalQuantity || 0}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">{t('inventory.lowStock', 'Niska zaliha')}</div>
                <div className="text-2xl font-bold text-red-400 mt-1">{stats.lowStockItems || 0}</div>
              </div>
            </div>
          )}

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="mt-4 bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  {t('inventory.lowStockAlert', 'Upozorenje:')} {lowStockItems.length} {t('inventory.itemsLowStock', 'artikala sa niskom zalihom')}
                </span>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('inventory.search', 'Pretraži artikle...')}
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
                {editingItem ? t('inventory.editItem', 'Izmeni artikal') : t('inventory.addItem', 'Dodaj artikal')}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
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
                    {t('inventory.itemCode', 'Šifra artikla')} *
                  </label>
                  <input
                    type="text"
                    name="itemCode"
                    value={formData.itemCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.name', 'Naziv')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.category', 'Kategorija')}
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.unit', 'Jedinica mere')} *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kom">kom</option>
                    <option value="kg">kg</option>
                    <option value="m">m</option>
                    <option value="l">l</option>
                    <option value="m²">m²</option>
                    <option value="m³">m³</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('inventory.purchasePrice', 'Nabavna cena')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="purchasePrice"
                    value={formData.purchasePrice}
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
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
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
                    {t('inventory.minQuantity', 'Minimalna zaliha')}
                  </label>
                  <input
                    type="number"
                    name="minQuantity"
                    value={formData.minQuantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  {t('common.cancel', 'Otkaži')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {editingItem ? t('common.save', 'Sačuvaj') : t('common.create', 'Kreiraj')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Items List */}
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.itemCode', 'Šifra')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.name', 'Naziv')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.category', 'Kategorija')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.quantity', 'Količina')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.reserved', 'Rezervisano')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.available', 'Dostupno')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('inventory.value', 'Vrednost')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('common.actions', 'Akcije')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                      {t('inventory.noItems', 'Nema artikala')}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-white">{item.itemCode}</td>
                      <td className="px-4 py-3 text-sm text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{item.category || '-'}</td>
                      <td className="px-4 py-3 text-sm text-white">
                        {item.currentQuantity || 0} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-400">
                        {item.reservedQuantity || 0} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-400">
                        {item.availableQuantity || 0} {item.unit}
                        {item.currentQuantity <= item.minQuantity && item.minQuantity > 0 && (
                          <AlertCircle className="inline-block ml-2 h-4 w-4 text-red-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(item.totalValue || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
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

        {/* Item Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">{selectedItem.name}</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">{t('inventory.itemCode', 'Šifra')}</div>
                    <div className="text-white font-medium">{selectedItem.itemCode}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{t('inventory.category', 'Kategorija')}</div>
                    <div className="text-white font-medium">{selectedItem.category || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{t('inventory.currentQuantity', 'Trenutna količina')}</div>
                    <div className="text-white font-medium">
                      {selectedItem.currentQuantity || 0} {selectedItem.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{t('inventory.reserved', 'Rezervisano')}</div>
                    <div className="text-yellow-400 font-medium">
                      {selectedItem.reservedQuantity || 0} {selectedItem.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{t('inventory.available', 'Dostupno')}</div>
                    <div className="text-green-400 font-medium">
                      {selectedItem.availableQuantity || 0} {selectedItem.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{t('inventory.minQuantity', 'Minimalna zaliha')}</div>
                    <div className="text-white font-medium">
                      {selectedItem.minQuantity || 0} {selectedItem.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{t('inventory.purchasePrice', 'Nabavna cena')}</div>
                    <div className="text-white font-medium">
                      {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(selectedItem.purchasePrice || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{t('inventory.sellingPrice', 'Prodajna cena')}</div>
                    <div className="text-white font-medium">
                      {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(selectedItem.sellingPrice || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{t('inventory.totalValue', 'Ukupna vrednost')}</div>
                    <div className="text-white font-bold text-lg">
                      {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(selectedItem.totalValue || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{t('inventory.warehouseLocation', 'Lokacija')}</div>
                    <div className="text-white font-medium">
                      {selectedItem.warehouseLocation || '-'}
                      {selectedItem.storageSector && ` / ${selectedItem.storageSector}`}
                      {selectedItem.storageBin && ` / ${selectedItem.storageBin}`}
                    </div>
                  </div>
                </div>
                {selectedItem.description && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-400 mb-1">{t('inventory.description', 'Opis')}</div>
                    <div className="text-white">{selectedItem.description}</div>
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      handleEdit(selectedItem);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    {t('common.edit', 'Uredi')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryView;

