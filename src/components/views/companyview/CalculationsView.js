import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  Calculator, BarChart3, DollarSign, Package, TrendingUp, Calendar, FileText, Download 
} from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import {
  getCalculations
} from '../../../redux/api';

const CalculationsView = () => {
  const { t } = useTranslation();
  const [calculations, setCalculations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCalculations();
  }, [dateRange]);

  const fetchCalculations = async () => {
    try {
      setLoading(true);
      const response = await getCalculations(dateRange);
      setCalculations(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri učitavanju kalkulacija');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCSV = () => {
    if (!calculations) return '';
    const lines = [
      'Kategorija,Vrednost',
      `Ukupno artikala,${calculations.inventory?.totalItems || 0}`,
      `Ukupna količina,${calculations.inventory?.totalQuantity || 0}`,
      `Ukupna vrednost zaliha,${calculations.inventory?.totalValue || 0}`,
      `Ulazi - broj,${calculations.transactions?.inputs?.count || 0}`,
      `Ulazi - količina,${calculations.transactions?.inputs?.quantity || 0}`,
      `Ulazi - vrednost,${calculations.transactions?.inputs?.value || 0}`,
      `Izlazi - broj,${calculations.transactions?.outputs?.count || 0}`,
      `Izlazi - količina,${calculations.transactions?.outputs?.quantity || 0}`,
      `Izlazi - vrednost,${calculations.transactions?.outputs?.value || 0}`,
      `Neto promena količine,${calculations.transactions?.netChange || 0}`,
      `Neto promena vrednosti,${calculations.transactions?.netValue || 0}`,
      `Ulazni PDV,${calculations.vat?.inputVAT || 0}`,
      `Ukupan PDV,${calculations.vat?.totalVAT || 0}`,
      `Carinske deklaracije,${calculations.customs?.totalDeclarations || 0}`,
      `Carina,${calculations.customs?.totalCustomsDuty || 0}`,
      `PDV na uvoz,${calculations.customs?.totalCustomsVAT || 0}`,
      `Ukupno carina,${calculations.customs?.totalCustomsAmount || 0}`,
      `Trošak materijala,${calculations.jobMaterials?.totalCost || 0}`,
      `Prihod materijala,${calculations.jobMaterials?.totalRevenue || 0}`,
      `Marža materijala,${calculations.jobMaterials?.totalMargin || 0}`,
      `Marža %,${calculations.jobMaterials?.marginPercentage?.toFixed(2) || 0}`
    ];
    return lines.join('\n');
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  if (!calculations) {
    return null;
  }

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                {t('inventory.calculations.title', 'Kalkulacije i izveštaji')}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {t('inventory.calculations.subtitle', 'Pregled vrednovanja zaliha, transakcija i kalkulacija')}
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const csv = generateCSV();
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `kalkulacije_${dateRange.startDate}_${dateRange.endDate}.csv`;
                  a.click();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                <Download className="h-4 w-4" />
                {t('common.export', 'Izvezi CSV')}
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Valuation */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('inventory.calculations.inventoryValuation', 'Vrednovanje zaliha')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.totalItems', 'Ukupno artikala')}</div>
              <div className="text-2xl font-bold text-white mt-1">{calculations.inventory?.totalItems || 0}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.totalQuantity', 'Ukupna količina')}</div>
              <div className="text-2xl font-bold text-white mt-1">{calculations.inventory?.totalQuantity || 0}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.totalValue', 'Ukupna vrednost')}</div>
              <div className="text-2xl font-bold text-white mt-1">
                {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.inventory?.totalValue || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Summary */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('inventory.calculations.transactionsSummary', 'Sažetak transakcija')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('inventory.inputs.title', 'Ulazi')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('common.count', 'Broj')}:</span>
                  <span className="text-white">{calculations.transactions?.inputs?.count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('inventory.quantity', 'Količina')}:</span>
                  <span className="text-white">{calculations.transactions?.inputs?.quantity || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('inventory.value', 'Vrednost')}:</span>
                  <span className="text-white font-bold">
                    {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.transactions?.inputs?.value || 0)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('inventory.outputs.title', 'Izlazi')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('common.count', 'Broj')}:</span>
                  <span className="text-white">{calculations.transactions?.outputs?.count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('inventory.quantity', 'Količina')}:</span>
                  <span className="text-white">{calculations.transactions?.outputs?.quantity || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('inventory.value', 'Vrednost')}:</span>
                  <span className="text-white font-bold">
                    {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.transactions?.outputs?.value || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">{t('inventory.calculations.netChange', 'Neto promena količine')}</div>
                <div className="text-xl font-bold text-white mt-1">
                  {calculations.transactions?.netChange || 0}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">{t('inventory.calculations.netValue', 'Neto promena vrednosti')}</div>
                <div className="text-xl font-bold text-white mt-1">
                  {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.transactions?.netValue || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VAT Summary */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('inventory.calculations.vatSummary', 'PDV sažetak')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.calculations.inputVAT', 'Ulazni PDV')}</div>
              <div className="text-2xl font-bold text-white mt-1">
                {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.vat?.inputVAT || 0)}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.calculations.totalVAT', 'Ukupan PDV')}</div>
              <div className="text-2xl font-bold text-white mt-1">
                {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.vat?.totalVAT || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Customs Summary */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('inventory.customs.title', 'Carina')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.calculations.totalDeclarations', 'Ukupno deklaracija')}</div>
              <div className="text-2xl font-bold text-white mt-1">{calculations.customs?.totalDeclarations || 0}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.customs.customsDuty', 'Carina')}</div>
              <div className="text-2xl font-bold text-white mt-1">
                {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.customs?.totalCustomsDuty || 0)}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.customs.vatAmount', 'PDV na uvoz')}</div>
              <div className="text-2xl font-bold text-white mt-1">
                {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.customs?.totalCustomsVAT || 0)}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.customs.totalAmount', 'Ukupno')}</div>
              <div className="text-2xl font-bold text-white mt-1">
                {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.customs?.totalCustomsAmount || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Job Materials */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('inventory.calculations.jobMaterials', 'Materijal za poslove')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.calculations.totalCost', 'Ukupni trošak')}</div>
              <div className="text-2xl font-bold text-white mt-1">
                {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.jobMaterials?.totalCost || 0)}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.calculations.totalRevenue', 'Ukupan prihod')}</div>
              <div className="text-2xl font-bold text-white mt-1">
                {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.jobMaterials?.totalRevenue || 0)}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.calculations.totalMargin', 'Ukupna marža')}</div>
              <div className="text-2xl font-bold text-green-400 mt-1">
                {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(calculations.jobMaterials?.totalMargin || 0)}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">{t('inventory.calculations.marginPercentage', 'Marža (%)')}</div>
              <div className="text-2xl font-bold text-green-400 mt-1">
                {calculations.jobMaterials?.marginPercentage?.toFixed(2) || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculationsView;

