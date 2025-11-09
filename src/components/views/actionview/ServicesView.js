import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import HeaderSection from '../../header/HeaderSection.js';
import {
  fetchDeviceCategories,
  createDeviceCategory,
  updateDeviceCategory,
  deleteDeviceCategory,
  fetchServicesList,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
} from '../../../redux/api';

const defaultCategoryColor = '#3B82F6';

const ServicesView = ({ title = 'Usluge' }) => {
  const [deviceCategories, setDeviceCategories] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingService, setSavingService] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(defaultCategoryColor);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');

  const [expandedCategoryId, setExpandedCategoryId] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingService, setEditingService] = useState(null);

  const profile = useMemo(() => {
    try {
      const raw = localStorage.getItem('profile');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Ne možemo da učitamo profil iz memorije:', error);
      return null;
    }
  }, []);

  const isPrivilegedUser = useMemo(() => {
    const role = profile?.result?.role;
    return role === 'superadmin' || role === 'owner' || role === 'admin';
  }, [profile]);

  const categoryMap = useMemo(
    () =>
      deviceCategories.reduce((acc, category) => {
        acc[category.id] = category;
        return acc;
      }, {}),
    [deviceCategories]
  );

  const categoryOptions = useMemo(
    () =>
      deviceCategories.map(category => ({
        value: category.id,
        label: category.name,
      })),
    [deviceCategories]
  );

  const servicesByCategory = useMemo(() => {
    return deviceCategories.reduce((acc, category) => {
      acc[category.id] = services.filter(service => service.deviceCategoryId === category.id);
      return acc;
    }, {});
  }, [deviceCategories, services]);

  const formatPrice = price => {
    if (price === null || price === undefined || price === '') return '';
    const numeric = Number(price);
    return Number.isFinite(numeric) ? `${numeric.toLocaleString('sr-RS')} RSD` : price;
  };

  const formatDuration = minutes => {
    if (minutes === null || minutes === undefined || minutes === '') return 'Trajanje nije postavljeno';
    const total = Number(minutes);
    if (!Number.isFinite(total)) return 'Trajanje nije postavljeno';
    if (total < 60) return `${total} min`;
    const hours = Math.floor(total / 60);
    const rem = total % 60;
    return rem === 0 ? `${hours}h` : `${hours}h ${rem}min`;
  };

  const toggleCategory = categoryId => {
    setExpandedCategoryId(prev => {
      const next = prev === categoryId ? '' : categoryId;
      if (next) {
        setNewServiceCategory(categoryId);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isPrivilegedUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesResponse, servicesResponse] = await Promise.all([
          fetchDeviceCategories(),
          fetchServicesList(),
        ]);

        setDeviceCategories(Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []);
        setServices(Array.isArray(servicesResponse?.data) ? servicesResponse.data : []);
      } catch (error) {
        console.error('Greška pri učitavanju podataka o uslugama:', error);
        toast.error('Ne možemo da učitamo usluge. Proveri vezu sa serverom.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isPrivilegedUser]);

  useEffect(() => {
    setNewServiceCategory(prev => {
      if (prev && deviceCategories.some(category => category.id === prev)) {
        return prev;
      }
      return '';
    });
  }, [deviceCategories]);

  const handleAddCategory = async event => {
    event.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast.info('Unesi naziv kategorije.');
      return;
    }

    if (deviceCategories.some(category => category.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.info('Kategorija sa tim nazivom već postoji.');
      setNewCategoryName('');
      return;
    }

    setSavingCategory(true);
    try {
      const { data } = await createDeviceCategory({ name: trimmedName, color: newCategoryColor });
      const createdCategory = data || { id: trimmedName.toLowerCase(), name: trimmedName, color: newCategoryColor };
      setDeviceCategories(prev => [...prev, createdCategory]);
      setNewCategoryName('');
      setNewCategoryColor(defaultCategoryColor);
      toast.success('Kategorija je dodata.');
    } catch (error) {
      console.error('Greška pri dodavanju kategorije:', error);
      toast.error('Nismo mogli da sačuvamo kategoriju. Pokušaj ponovo.');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleAddService = async event => {
    event.preventDefault();
    const trimmedName = newServiceName.trim();

    if (!trimmedName) {
      toast.info('Unesi naziv usluge.');
      return;
    }

    if (!newServiceCategory || !categoryMap[newServiceCategory]) {
      toast.info('Izaberi kategoriju.');
      return;
    }

    if (newServiceDuration && Number.isNaN(Number(newServiceDuration))) {
      toast.info('Trajanje mora biti broj u minutima.');
      return;
    }

    setSavingService(true);
    try {
      const trimmedPrice = newServicePrice.trim();
      const numericPrice = trimmedPrice === '' ? null : Number(trimmedPrice.replace(',', '.'));
      const payload = {
        name: trimmedName,
        price: numericPrice !== null && Number.isFinite(numericPrice) ? numericPrice : null,
        durationMinutes:
          newServiceDuration === '' || newServiceDuration === null ? null : Number(newServiceDuration),
        deviceCategoryId: newServiceCategory,
      };
      const { data } = await createServiceItem(payload);
      const categoryRef = categoryMap[newServiceCategory];
      const createdService = data || {
        id: trimmedName.toLowerCase(),
        name: trimmedName,
        price: payload.price,
        durationMinutes: payload.durationMinutes,
        deviceCategoryId: newServiceCategory,
        deviceCategory: categoryRef,
      };
      setServices(prev => [createdService, ...prev]);
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceDuration('');
      setNewServiceCategory(newServiceCategory);
      setExpandedCategoryId(newServiceCategory);
      toast.success('Usluga je dodata.');
    } catch (error) {
      console.error('Greška pri dodavanju usluge:', error);
      toast.error('Nismo mogli da sačuvamo uslugu. Pokušaj ponovo.');
    } finally {
      setSavingService(false);
    }
  };

  const startCategoryEdit = category => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      color: category.color || defaultCategoryColor,
    });
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
  };

  const handleUpdateCategory = async event => {
    event.preventDefault();
    if (!editingCategory) return;
    const trimmedName = editingCategory.name.trim();
    if (!trimmedName) {
      toast.info('Unesi naziv kategorije.');
      return;
    }
    setSavingCategory(true);
    try {
      const response = await updateDeviceCategory({
        id: editingCategory.id,
        categoryData: {
          name: trimmedName,
          color: editingCategory.color || defaultCategoryColor,
        },
      });
      const updatedCategory = response?.data || {
        id: editingCategory.id,
        name: trimmedName,
        color: editingCategory.color || defaultCategoryColor,
      };
      setDeviceCategories(prev =>
        prev.map(category => (category.id === updatedCategory.id ? { ...category, ...updatedCategory } : category))
      );
      toast.success('Kategorija je ažurirana.');
      setEditingCategory(null);
    } catch (error) {
      console.error('Greška pri ažuriranju kategorije:', error);
      toast.error('Nismo mogli da ažuriramo kategoriju. Pokušaj ponovo.');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async categoryId => {
    if (!window.confirm('Da li sigurno želiš da obrišeš ovu kategoriju? Sve povezane usluge će biti uklonjene.')) {
      return;
    }
    try {
      await deleteDeviceCategory(categoryId);
      setDeviceCategories(prev => prev.filter(category => category.id !== categoryId));
      setServices(prev => prev.filter(service => service.deviceCategoryId !== categoryId));
      if (expandedCategoryId === categoryId) {
        setExpandedCategoryId('');
      }
      if (newServiceCategory === categoryId) {
        setNewServiceCategory('');
      }
      if (editingCategory?.id === categoryId) {
        setEditingCategory(null);
      }
      toast.success('Kategorija je obrisana.');
    } catch (error) {
      console.error('Greška pri brisanju kategorije:', error);
      toast.error('Nismo mogli da obrišemo kategoriju. Pokušaj ponovo.');
    }
  };

  const startServiceEdit = service => {
    setEditingService({
      id: service.id,
      name: service.name,
      price: service.price ?? '',
      durationMinutes: service.durationMinutes ?? '',
      deviceCategoryId: service.deviceCategoryId || service.deviceCategory?.id || '',
    });
    if (service.deviceCategoryId) {
      setExpandedCategoryId(service.deviceCategoryId);
    }
  };

  const cancelServiceEdit = () => {
    setEditingService(null);
  };

  const handleUpdateService = async event => {
    event.preventDefault();
    if (!editingService) return;
    const trimmedName = editingService.name.trim();
    if (!trimmedName) {
      toast.info('Unesi naziv usluge.');
      return;
    }
    if (!editingService.deviceCategoryId) {
      toast.info('Izaberi kategoriju za uslugu.');
      return;
    }
    if (editingService.durationMinutes !== '' && Number.isNaN(Number(editingService.durationMinutes))) {
      toast.info('Trajanje mora biti broj u minutima.');
      return;
    }

    setSavingService(true);
    try {
      const payload = {
        name: trimmedName,
        price:
          editingService.price === '' || editingService.price === null
            ? null
            : Number(editingService.price),
        durationMinutes:
          editingService.durationMinutes === '' || editingService.durationMinutes === null
            ? null
            : Number(editingService.durationMinutes),
        deviceCategoryId: editingService.deviceCategoryId,
      };
      const response = await updateServiceItem({
        id: editingService.id,
        serviceData: payload,
      });
      const resolvedCategory =
        categoryMap[payload.deviceCategoryId] ||
        editingService.deviceCategory ||
        services.find(service => service.id === editingService.id)?.deviceCategory ||
        null;
      const updatedService = response?.data || {
        ...editingService,
        name: trimmedName,
        price: payload.price,
        durationMinutes: payload.durationMinutes,
        deviceCategoryId: payload.deviceCategoryId,
        deviceCategory: resolvedCategory,
      };
      setServices(prev =>
        prev.map(service =>
          service.id === updatedService.id
            ? { ...service, ...updatedService, deviceCategory: resolvedCategory }
            : service
        )
      );
      setExpandedCategoryId(payload.deviceCategoryId);
      toast.success('Usluga je ažurirana.');
      setEditingService(null);
    } catch (error) {
      console.error('Greška pri ažuriranju usluge:', error);
      toast.error('Nismo mogli da ažuriramo uslugu. Pokušaj ponovo.');
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async serviceId => {
    if (!window.confirm('Da li sigurno želiš da obrišeš ovu uslugu?')) {
      return;
    }
    try {
      await deleteServiceItem(serviceId);
      setServices(prev => prev.filter(service => service.id !== serviceId));
      if (editingService?.id === serviceId) {
        setEditingService(null);
      }
      toast.success('Usluga je obrisana.');
    } catch (error) {
      console.error('Greška pri brisanju usluge:', error);
      toast.error('Nismo mogli da obrišemo uslugu. Pokušaj ponovo.');
    }
  };

  if (!isPrivilegedUser) {
    return (
      <div className="space-y-6 min-h-screen bg-slate-900 text-slate-100">
        <HeaderSection section={title} />
        <div className="max-w-3xl mx-auto bg-gray-800/80 border border-gray-700 rounded-xl p-6 text-sm text-gray-200">
          <h2 className="text-lg font-semibold text-white mb-3">Pristup ograničen</h2>
          <p>Kontaktiraj administratora da ti dodeli ovlašćenja za ažuriranje usluga.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-sm text-slate-300">Učitavamo podatke o uslugama...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-slate-900 text-slate-100">
      <HeaderSection section={title} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 bg-gray-800/80 border border-gray-700 rounded-xl p-5 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Kategorije uređaja</h2>
            <p className="text-xs text-gray-400">Klikni na kategoriju da vidiš usluge i njihove detalje.</p>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                value={newCategoryName}
                onChange={event => setNewCategoryName(event.target.value)}
                placeholder="Naziv kategorije (npr. Veš mašine)"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Boja:</label>
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={event => setNewCategoryColor(event.target.value)}
                  className="h-9 w-12 rounded cursor-pointer border border-gray-700 bg-gray-900"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
              disabled={savingCategory}
            >
              {savingCategory ? 'Čuvamo...' : 'Dodaj kategoriju'}
            </button>
          </form>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {deviceCategories.length === 0 ? (
              <p className="text-sm text-gray-400">Još uvek nema kategorija. Dodaj prvu pomoću forme iznad.</p>
            ) : (
              deviceCategories.map(category => {
                const servicesInCategory = servicesByCategory[category.id] || [];
                const isExpanded = expandedCategoryId === category.id;
                const isEditing = editingCategory?.id === category.id;
                return (
                  <div key={category.id} className="bg-gray-900/70 border border-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="flex items-start gap-3 text-left text-white flex-1"
                      >
                        <span className="text-xs text-gray-400 pt-1">{isExpanded ? '▼' : '▶'}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{category.name}</p>
                          <p className="text-xs text-gray-400">{servicesInCategory.length} usluga</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCategoryEdit(category)}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                        >
                          Izmeni
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Obriši
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <form onSubmit={handleUpdateCategory} className="space-y-3 bg-gray-900 border border-gray-700 rounded-lg p-3">
                        <input
                          value={editingCategory.name}
                          onChange={event =>
                            setEditingCategory(prev => ({ ...prev, name: event.target.value }))
                          }
                          placeholder="Naziv kategorije"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-gray-400">Boja:</label>
                          <input
                            type="color"
                            value={editingCategory.color || defaultCategoryColor}
                            onChange={event =>
                              setEditingCategory(prev => ({ ...prev, color: event.target.value }))
                            }
                            className="h-9 w-12 rounded cursor-pointer border border-gray-700 bg-gray-900"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-2 rounded"
                            disabled={savingCategory}
                          >
                            Sačuvaj
                          </button>
                          <button
                            type="button"
                            onClick={cancelCategoryEdit}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-3 py-2 rounded"
                          >
                            Otkaži
                          </button>
                        </div>
                      </form>
                    )}

                    {isExpanded && (
                      <div className="space-y-3">
                        {servicesInCategory.length === 0 ? (
                          <p className="text-xs text-gray-400">Još nema usluga u ovoj kategoriji.</p>
                        ) : (
                          servicesInCategory.map(service => {
                            const isServiceEditing = editingService?.id === service.id;
                            return (
                              <div key={service.id} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                                {isServiceEditing ? (
                                  <form onSubmit={handleUpdateService} className="space-y-3">
                                    <input
                                      value={editingService.name}
                                      onChange={event =>
                                        setEditingService(prev => ({
                                          ...prev,
                                          name: event.target.value,
                                        }))
                                      }
                                      placeholder="Naziv usluge"
                                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <select
                                        value={editingService.deviceCategoryId}
                                        onChange={event =>
                                          setEditingService(prev => ({
                                            ...prev,
                                            deviceCategoryId: event.target.value,
                                          }))
                                        }
                                        className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        <option value="">Izaberi kategoriju</option>
                                        {categoryOptions.map(option => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                      <input
                                        value={editingService.price}
                                        onChange={event =>
                                          setEditingService(prev => ({
                                            ...prev,
                                            price: event.target.value,
                                          }))
                                        }
                                        placeholder="Cena (opciono)"
                                        className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                      />
                                    </div>
                                    <input
                                      value={editingService.durationMinutes}
                                      onChange={event =>
                                        setEditingService(prev => ({
                                          ...prev,
                                          durationMinutes: event.target.value,
                                        }))
                                      }
                                      placeholder="Trajanje u minutima (opciono)"
                                      className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="submit"
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-2 rounded disabled:opacity-70"
                                        disabled={savingService}
                                      >
                                        Sačuvaj
                                      </button>
                                      <button
                                        type="button"
                                        onClick={cancelServiceEdit}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-3 py-2 rounded"
                                      >
                                        Otkaži
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-semibold text-white">{service.name}</p>
                                        <p className="text-xs text-gray-400">{formatDuration(service.durationMinutes)}</p>
                                      </div>
                                      <div className="text-right space-y-1">
                                        <div className="text-xs text-emerald-300 font-semibold">
                                          {formatPrice(service.price)}
                                        </div>
                                        <div className="flex items-center gap-2 justify-end">
                                          <button
                                            type="button"
                                            onClick={() => startServiceEdit(service)}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                                          >
                                            Izmeni
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteService(service.id)}
                                            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                          >
                                            Obriši
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="lg:col-span-3 bg-gray-800/80 border border-gray-700 rounded-xl p-5 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Dodaj novu uslugu</h2>
            <p className="text-xs text-gray-400">
              Usluga se vezuje direktno za kategoriju. Serviseri će odmah videti trajanje i cenu.
            </p>
          </div>

          <form onSubmit={handleAddService} className="space-y-3 bg-gray-900/60 border border-gray-700 rounded-lg p-4">
            <input
              value={newServiceName}
              onChange={event => setNewServiceName(event.target.value)}
              placeholder="Naziv usluge (npr. Zamena pumpe)"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={newServiceCategory}
                onChange={event => setNewServiceCategory(event.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{categoryOptions.length === 0 ? 'Prvo dodaj kategoriju' : 'Izaberi kategoriju'}</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                value={newServicePrice}
                onChange={event => setNewServicePrice(event.target.value)}
                placeholder="Cena (opciono)"
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <input
                value={newServiceDuration}
                onChange={event => setNewServiceDuration(event.target.value)}
                placeholder="Trajanje u minutima (opciono)"
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
              disabled={savingService || !newServiceName.trim() || categoryOptions.length === 0 || !newServiceCategory}
            >
              {savingService ? 'Čuvamo...' : 'Dodaj uslugu'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Brzi pregled</h3>
            {services.length === 0 ? (
              <p className="text-xs text-gray-400">
                Još nema unetih usluga. Dodaj ih kako bi serviseri imali jasna uputstva.
              </p>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {services.map(service => {
                  const category = service.deviceCategory || categoryMap[service.deviceCategoryId];
                  return (
                    <div key={service.id} className="bg-gray-900/60 border border-gray-700 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{service.name}</p>
                        <p className="text-xs text-gray-400">{category?.name || 'Bez kategorije'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-emerald-300 font-semibold">{formatPrice(service.price)}</p>
                        <p className="text-[11px] text-gray-400">{formatDuration(service.durationMinutes)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicesView;

