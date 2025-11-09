import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { fetchCompanyById, updateCompanyById } from '../../../redux/api';
import { setUser } from '../../../redux/features/authSlice';
import businessTypeConfig from '../../../utils/businessTypeConfig';

const CompanyInfoView = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const companyFromStore = useMemo(() => {
    if (!user) {
      return null;
    }

    return user.result || user;
  }, [user]);

  const companyId = companyFromStore?._id;

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    businessType: '',
    countryCode: '',
    pib: '',
    registrationNumber: '',
    bankAccount: '',
    bankName: '',
    website: ''
  });

  const [metaData, setMetaData] = useState({
    created: '',
    lastUpdated: ''
  });

  const mapCompanyToForm = (company) => ({
    ownerName: company?.ownerName || '',
    companyName: company?.companyName || '',
    email: company?.email || '',
    phone: company?.phone || '',
    address: company?.address || '',
    city: company?.city || '',
    businessType: company?.businessType || '',
    countryCode: company?.countryCode || '',
    pib: company?.pib || '',
    registrationNumber: company?.registrationNumber || '',
    bankAccount: company?.bankAccount || '',
    bankName: company?.bankName || '',
    website: company?.website || ''
  });

  const mapCompanyToMeta = (company) => ({
    created: company?.created || company?.createdAt || '',
    lastUpdated: company?.lastUpdated || company?.updatedAt || ''
  });

  useEffect(() => {
    const initialize = async () => {
      if (!companyId) {
        setInitialLoading(false);
        return;
      }

      try {
        const { data } = await fetchCompanyById(companyId);
        setFormData(mapCompanyToForm(data));
        setMetaData(mapCompanyToMeta(data));
      } catch (error) {
        console.error('Error loading company info:', error);
        toast.error('Neuspešno učitavanje podataka o kompaniji');
        if (companyFromStore) {
          setFormData(mapCompanyToForm(companyFromStore));
          setMetaData(mapCompanyToMeta(companyFromStore));
        }
      } finally {
        setInitialLoading(false);
      }
    };

    initialize();
  }, [companyFromStore, companyId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!companyId) {
      toast.error('Nedostaje identifikator kompanije');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData };

      // Prevent editing immutable fields on backend if sent as empty string
      if (!payload.registrationNumber) {
        delete payload.registrationNumber;
      }

      const { data } = await updateCompanyById(companyId, payload);

      setFormData(mapCompanyToForm(data));
      setMetaData(mapCompanyToMeta(data));

      const profileRaw = localStorage.getItem('profile');
      if (profileRaw) {
        try {
          const profile = JSON.parse(profileRaw);
          const updatedProfile = {
            ...profile,
            result: {
              ...(profile.result || {}),
              ...data
            }
          };
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          dispatch(setUser(updatedProfile));
        } catch (parseError) {
          console.error('Error updating local profile cache:', parseError);
          localStorage.setItem('profile', JSON.stringify({ result: data }));
          dispatch(setUser({ result: data }));
        }
      } else {
        localStorage.setItem('profile', JSON.stringify({ result: data }));
        dispatch(setUser({ result: data }));
      }

      toast.success('Podaci kompanije su uspešno sačuvani');
    } catch (error) {
      console.error('Error saving company info:', error);
      const message = error.response?.data?.message || 'Greška pri čuvanju podataka';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full border border-gray-600 rounded px-3 py-2 text-sm text-white bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';
  const labelClass = 'text-xs font-medium text-gray-300 uppercase tracking-wide';

  const formattedDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return `${date.toLocaleDateString('sr-RS')} ${date.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (initialLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Podaci o kompaniji</h1>
              <p className="text-sm text-gray-400 mt-1">
                Pregled i izmena osnovnih informacija o firmi koje koristite u SpinTasker sistemu.
              </p>
            </div>
            {companyFromStore?.countryCode && (
              <img
                src={`https://flagcdn.com/${companyFromStore.countryCode.toLowerCase()}.svg`}
                alt={`${companyFromStore.countryCode} flag`}
                className="w-10 h-6 rounded shadow"
              />
            )}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm text-gray-400">
            <div>
              <dt className="font-medium text-gray-500">Kreirano</dt>
              <dd className="text-white mt-1">{formattedDate(metaData.created)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Poslednje ažuriranje</dt>
              <dd className="text-white mt-1">{formattedDate(metaData.lastUpdated)}</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Osnovni podaci</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass} htmlFor="companyName">Naziv kompanije</label>
                <input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass} htmlFor="ownerName">Vlasnik</label>
                <input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass} htmlFor="businessType">Tip poslovanja</label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="" disabled>Izaberite tip poslovanja</option>
                  {Object.keys(businessTypeConfig).map((type) => (
                    <option key={type} value={type}>
                      {businessTypeConfig[type]?.displayName || type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass} htmlFor="website">Veb sajt</label>
                <input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://"
                />
              </div>
            </div>
          </section>

          <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Kontakt i lokacija</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass} htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputClass} bg-gray-800 text-gray-400 cursor-not-allowed`}
                  readOnly
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass} htmlFor="phone">Telefon</label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="+381"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass} htmlFor="city">Grad</label>
                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass} htmlFor="address">Adresa</label>
                <input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Finansijski i legalni podaci</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass} htmlFor="pib">PIB</label>
                <input
                  id="pib"
                  name="pib"
                  value={formData.pib}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass} htmlFor="registrationNumber">Matični broj</label>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="01234567"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass} htmlFor="bankAccount">Žiro račun</label>
                <input
                  id="bankAccount"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="123-456789-10"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass} htmlFor="bankName">Banka</label>
                <input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Naziv banke"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Sačuvaj promene
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInfoView;

