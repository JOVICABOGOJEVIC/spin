import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  Banknote, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  FileText,
  Copy,
  Heart,
  CreditCard,
  X
} from 'lucide-react';
import { 
  getSubscriptionPayments, 
  createSubscriptionPayment, 
  markSubscriptionPaymentAsPaid,
  getSubscriptionPaymentInfo,
  getSubscriptionStats 
} from '../../../redux/features/subscriptionPaymentSlice';
import { toast } from 'react-toastify';

const WireTransferView = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { payments, loading, stats, paymentInfo } = useSelector((state) => state.subscriptionPayment);
  const { user } = useSelector((state) => state.auth);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentType: 'all',
    search: ''
  });

  useEffect(() => {
    dispatch(getSubscriptionPayments());
    dispatch(getSubscriptionStats());
    dispatch(getSubscriptionPaymentInfo());
  }, [dispatch]);

  const filteredPayments = payments?.filter(payment => {
    if (filters.status !== 'all' && payment.status !== filters.status) {
      return false;
    }
    if (filters.paymentType !== 'all' && payment.paymentType !== filters.paymentType) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        payment.paymentNumber?.toLowerCase().includes(searchLower) ||
        payment.companyId?.companyName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }) || [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Na čekanju' },
      PAID: { bg: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Plaćeno' },
      VERIFIED: { bg: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Verifikovano' },
      CANCELLED: { bg: 'bg-gray-100 text-gray-800', icon: X, label: 'Otkazano' }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.bg}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopirano u clipboard');
  };

  const packagePrices = {
    free: 0,
    standard: 29, // €29
    business: 79, // €79
    premium: 199  // €199
  };

  const packageNames = {
    free: 'Free',
    standard: 'Standard',
    business: 'Business',
    premium: 'Premium'
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 rounded-lg p-4">
                <Banknote className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Pretplata - Virman Plaćanje
                </h1>
                <p className="text-gray-400 mt-1">
                  Plaćanje preplate za korišćenje SpinTasker aplikacije
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Pretplata
            </button>
          </div>
        </div>

        {/* Payment Info Card (Your Account) */}
        {paymentInfo && (
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl shadow-xl p-6 border border-blue-700 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <CreditCard className="h-6 w-6 text-blue-300" />
              <h2 className="text-xl font-bold text-white">Podaci za Plaćanje</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-blue-200 mb-1 block">Naziv Banke</label>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 bg-blue-700/50 rounded-lg text-white font-medium flex-1">
                    {paymentInfo.recipientBankName}
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.recipientBankName)}
                    className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-blue-200 mb-1 block">Broj Računa</label>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 bg-blue-700/50 rounded-lg text-white font-mono font-medium flex-1">
                    {paymentInfo.recipientAccountNumber}
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.recipientAccountNumber)}
                    className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-blue-200 mb-1 block">Vlasnik Računa</label>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 bg-blue-700/50 rounded-lg text-white font-medium flex-1">
                    {paymentInfo.recipientAccountHolder}
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.recipientAccountHolder)}
                    className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-blue-200 mb-1 block">Model (97 za RSD)</label>
                <div className="px-4 py-2 bg-blue-700/50 rounded-lg text-white font-medium">
                  {paymentInfo.model}
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-700/30 rounded-lg border border-blue-600">
              <p className="text-sm text-blue-200">
                <strong>Napomena:</strong> Koristite "Poziv na broj" koji ćete dobiti kada kreirate zahtev za plaćanje.
                Svrha plaćanja: <strong>{paymentInfo.purpose}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Ukupno Plaćanja</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.totals?.totalPayments || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Ukupan Iznos</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats.totals?.totalAmount?.toLocaleString('sr-RS') || 0} RSD
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Plaćeno</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats.totals?.paidAmount?.toLocaleString('sr-RS') || 0} RSD
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Aktivna Pretplata</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {user?.result?.subscriptionActive ? packageNames[user?.result?.subscriptionPackage] || 'Free' : 'Free'}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pretraži plaćanja..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Svi statusi</option>
              <option value="PENDING">Na čekanju</option>
              <option value="PAID">Plaćeno</option>
              <option value="VERIFIED">Verifikovano</option>
              <option value="CANCELLED">Otkazano</option>
            </select>
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Svi tipovi</option>
              <option value="DONATION">Donacija (Beta)</option>
              <option value="SUBSCRIPTION">Pretplata</option>
            </select>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              Učitavanje...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Banknote className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nemate zahteva za plaćanje</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Kreiraj prvi zahtev
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Broj Plaćanja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Paket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Iznos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{payment.paymentNumber}</div>
                        {payment.wireTransfer?.referenceNumber && (
                          <div className="text-xs text-gray-400">
                            Poziv: {payment.wireTransfer.referenceNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.paymentType === 'DONATION' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {payment.paymentType === 'DONATION' ? (
                            <>
                              <Heart className="w-3 h-3 inline mr-1" />
                              Donacija
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3 h-3 inline mr-1" />
                              Pretplata
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">
                          {packageNames[payment.subscriptionPackage] || payment.subscriptionPackage}
                        </div>
                        <div className="text-xs text-gray-400">
                          {payment.period === 'MONTHLY' ? 'Mesečna' : 
                           payment.period === 'BETA_MONTH_1' ? 'Beta Mesec 1' :
                           payment.period === 'BETA_MONTH_2' ? 'Beta Mesec 2' :
                           payment.period === 'BETA_MONTH_3' ? 'Beta Mesec 3' : payment.period}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {payment.amount.toLocaleString('sr-RS')} RSD
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(payment.paymentDate).toLocaleDateString('sr-RS')}
                        </div>
                        {payment.subscriptionEndDate && (
                          <div className="text-xs text-gray-400">
                            Ističe: {new Date(payment.subscriptionEndDate).toLocaleDateString('sr-RS')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {payment.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowPaymentModal(true);
                              }}
                              className="text-green-400 hover:text-green-300"
                              title="Evidentiraj plaćanje"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {payment.wireTransfer?.referenceNumber && (
                            <button
                              onClick={() => copyToClipboard(payment.wireTransfer.referenceNumber)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Kopiraj poziv na broj"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Payment Request Modal */}
      {showCreateModal && (
        <CreatePaymentModal
          paymentInfo={paymentInfo}
          user={user}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedPayment(null);
          }}
          onSave={async (paymentData) => {
            await dispatch(createSubscriptionPayment(paymentData));
            dispatch(getSubscriptionPayments());
            dispatch(getSubscriptionStats());
            setShowCreateModal(false);
            setSelectedPayment(null);
          }}
        />
      )}

      {/* Mark Payment as Paid Modal */}
      {showPaymentModal && selectedPayment && (
        <MarkPaymentPaidModal
          payment={selectedPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
          onSave={async (paymentData) => {
            await dispatch(markSubscriptionPaymentAsPaid({ id: selectedPayment._id, paymentData }));
            dispatch(getSubscriptionPayments());
            dispatch(getSubscriptionStats());
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};

// Create Payment Request Modal
const CreatePaymentModal = ({ paymentInfo, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    paymentType: 'DONATION', // Default to donation for beta
    period: 'BETA_MONTH_1',
    subscriptionPackage: user?.result?.subscriptionPackage || 'free',
    amount: 0
  });

  const packagePrices = {
    free: 0,
    standard: 29,
    business: 79,
    premium: 199
  };

  const packageNames = {
    free: 'Free',
    standard: 'Standard',
    business: 'Business',
    premium: 'Premium'
  };

  useEffect(() => {
    // Auto-set amount based on package
    if (formData.subscriptionPackage && formData.subscriptionPackage !== 'free') {
      setFormData(prev => ({
        ...prev,
        amount: packagePrices[formData.subscriptionPackage] || 0
      }));
    }
  }, [formData.subscriptionPackage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Kreiraj Zahtev za Plaćanje</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tip Plaćanja *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'DONATION', period: 'BETA_MONTH_1', amount: 0 })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.paymentType === 'DONATION'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-purple-400" />
                  <div className="text-left">
                    <div className="font-medium text-white">Donacija (Beta)</div>
                    <div className="text-xs text-gray-400">Za prva 3 meseca</div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'SUBSCRIPTION', period: 'MONTHLY' })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.paymentType === 'SUBSCRIPTION'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  <div className="text-left">
                    <div className="font-medium text-white">Pretplata</div>
                    <div className="text-xs text-gray-400">Mesečna preplata</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Period (for donations) */}
          {formData.paymentType === 'DONATION' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Beta Mesec *
              </label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BETA_MONTH_1">Beta Mesec 1 (Donacija)</option>
                <option value="BETA_MONTH_2">Beta Mesec 2 (Donacija)</option>
                <option value="BETA_MONTH_3">Beta Mesec 3 (Donacija)</option>
              </select>
              <p className="text-xs text-gray-400 mt-2">
                Donacije su dobrodošle i opcione. Koristite ih za podršku razvoju aplikacije.
              </p>
            </div>
          )}

          {/* Subscription Package */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Paket *
            </label>
            <select
              value={formData.subscriptionPackage}
              onChange={(e) => setFormData({ ...formData, subscriptionPackage: e.target.value })}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="free">Free (Besplatno)</option>
              <option value="standard">Standard (€29/mesec)</option>
              <option value="business">Business (€79/mesec)</option>
              <option value="premium">Premium (€199/mesec)</option>
            </select>
          </div>

          {/* Amount */}
          {formData.subscriptionPackage !== 'free' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Iznos (RSD) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Preporučeni iznos: {packagePrices[formData.subscriptionPackage]}€ ≈ {(packagePrices[formData.subscriptionPackage] * 117).toLocaleString('sr-RS')} RSD
              </p>
            </div>
          )}

          {/* Payment Info Display */}
          {paymentInfo && (
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <h3 className="text-sm font-medium text-white mb-3">Podaci za Plaćanje:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Banka:</span>
                  <span className="text-white">{paymentInfo.recipientBankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Račun:</span>
                  <span className="text-white font-mono">{paymentInfo.recipientAccountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vlasnik:</span>
                  <span className="text-white">{paymentInfo.recipientAccountHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Model:</span>
                  <span className="text-white">{paymentInfo.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Svrha:</span>
                  <span className="text-white">{paymentInfo.purpose}</span>
                </div>
                <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded text-yellow-200 text-xs">
                  <strong>Poziv na broj</strong> će biti generisan automatski kada kreirate zahtev.
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Napomena (opciono)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              placeholder="Dodatne napomene..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Kreiraj Zahtev
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Mark Payment as Paid Modal
const MarkPaymentPaidModal = ({ payment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    paymentReference: '',
    paymentNote: '',
    paidDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Evidentiraj Plaćanje</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Paket:</span>
                <span className="text-white font-medium">{payment.subscriptionPackage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Iznos:</span>
                <span className="text-white font-medium">{payment.amount.toLocaleString('sr-RS')} RSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Poziv na broj:</span>
                <span className="text-white font-mono text-xs">{payment.wireTransfer?.referenceNumber}</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Datum Plaćanja *
            </label>
            <input
              type="date"
              value={formData.paidDate}
              onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Referenca Plaćanja *
            </label>
            <input
              type="text"
              value={formData.paymentReference}
              onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
              placeholder="Broj transakcije iz banke..."
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Unesite referencu koju ste dobili iz banke nakon plaćanja
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Napomena (opciono)
            </label>
            <textarea
              value={formData.paymentNote}
              onChange={(e) => setFormData({ ...formData, paymentNote: e.target.value })}
              rows="3"
              placeholder="Dodatne napomene..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
            <p className="text-xs text-yellow-200">
              <strong>Napomena:</strong> Nakon što evidentirate plaćanje, vaš zahtev će biti na čekanju dok ne verifikujemo plaćanje.
              Pretplata će biti automatski aktivirana nakon verifikacije.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Evidentiraj Plaćanje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WireTransferView;
