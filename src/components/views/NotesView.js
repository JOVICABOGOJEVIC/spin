import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Plus, Trash2, Save, Bell, Pencil } from 'lucide-react';
import { getJobs } from '../../redux/features/jobSlice';
import { getGlobalNotifications } from '../../redux/api';
import { useWebSocket } from '../../contexts/WebSocketContext';

const createEmptyEntry = (type = 'note') => ({
  id: `${type}-${Date.now()}`,
  title: '',
  content: '',
  type,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const TAB_TO_TYPE = {
  notes: 'note',
  notifications: 'notification'
};

const NotificationsView = () => {
  const { user } = useSelector((state) => state.auth);
  const jobState = useSelector((state) => state.job || { jobs: [], loading: false });
  const jobList = Array.isArray(jobState.jobs) ? jobState.jobs : [];
  const jobsLoading = jobState.loading;
  const dispatch = useDispatch();
  const { socket, isConnected } = useWebSocket();
  const userId = user?.result?._id || 'anonymous';
  const storageKey = useMemo(() => `spinTasker_notes_${userId}`, [userId]);

  const [entries, setEntries] = useState([]);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [draft, setDraft] = useState(() => createEmptyEntry('note'));
  const [globalNotifications, setGlobalNotifications] = useState([]);
  const [loadingGlobalNotifications, setLoadingGlobalNotifications] = useState(false);
  const interestStorageKey = useMemo(() => `spinTasker_notification_interest_${userId}`, [userId]);
  const hiddenStorageKey = useMemo(() => `spinTasker_notification_hidden_${userId}`, [userId]);
  const [notificationInterest, setNotificationInterest] = useState({}); // { [notificationId]: 'interested'|'not_interested' }
  const [hiddenNotifications, setHiddenNotifications] = useState({}); // { [notificationId]: true }

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const normalised = parsed.map((item) => ({
            ...item,
            type: item.type || 'note'
          }));
          setEntries(normalised);
        }
      }
    } catch (error) {
      console.error('Failed to load notes from storage:', error);
      toast.error('Ne mogu da učitam beleške iz lokalne memorije');
    }
  }, [storageKey]);

  // Load per-user notification interest preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem(interestStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setNotificationInterest(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [interestStorageKey]);

  // Load hidden notifications
  useEffect(() => {
    try {
      const stored = localStorage.getItem(hiddenStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setHiddenNotifications(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [hiddenStorageKey]);

  useEffect(() => {
    if (jobList.length === 0 && !jobsLoading) {
      dispatch(getJobs(user?.result?.businessType));
    }
  }, [dispatch, jobList.length, jobsLoading, user?.result?.businessType]);

  // Fetch global notifications when notifications tab is active
  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchGlobalNotifications();
    }
  }, [activeTab]);

  // Listen for new global notifications via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (data) => {
      console.log('📢 Received new global notification:', data);
      // Add new notification to the list if not already present
      setGlobalNotifications(prev => {
        const exists = prev.some(n => n._id === data.notification._id);
        if (!exists) {
          toast.info(`Novo obaveštenje: ${data.notification.title}`);
          return [data.notification, ...prev];
        }
        return prev;
      });
    };

    socket.on('new_global_notification', handleNewNotification);

    return () => {
      socket.off('new_global_notification', handleNewNotification);
    };
  }, [socket, isConnected]);

  const fetchGlobalNotifications = async () => {
    try {
      setLoadingGlobalNotifications(true);
      const response = await getGlobalNotifications();
      setGlobalNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching global notifications:', error);
      // Don't show error toast as this is background fetch
    } finally {
      setLoadingGlobalNotifications(false);
    }
  };

  const persistEntries = (updatedEntries) => {
    setEntries(updatedEntries);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Failed to persist notes:', error);
      toast.error('Ne mogu da sačuvam beleške u lokalnu memoriju');
    }
  };

  const persistInterest = (updated) => {
    setNotificationInterest(updated);
    try {
      localStorage.setItem(interestStorageKey, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const persistHidden = (updated) => {
    setHiddenNotifications(updated);
    try {
      localStorage.setItem(hiddenStorageKey, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  // Track if we're in "create mode" (new entry being created)
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Reset form when tab changes
  useEffect(() => {
    const activeType = TAB_TO_TYPE[activeTab];
    
    // Always reset form state when tab changes
    setSelectedEntryId(null);
    setIsCreatingNew(false);
    
    // If switching to notifications tab, don't show form
    if (activeTab === 'notifications') {
      setDraft(createEmptyEntry('notification')); // Set empty draft but don't show form
      return;
    }
    
    // For notes tab, only auto-select first entry if there are entries
    if (activeTab === 'notes') {
      const first = entries.find((entry) => (entry.type || 'note') === 'note');
      if (first) {
        // Don't auto-select, just clear form - user can click to select
        setDraft(createEmptyEntry('note'));
      } else {
        // No entries, prepare empty form
        setDraft(createEmptyEntry('note'));
      }
    }
  }, [activeTab]); // Reset when tab changes

  const handleCreate = () => {
    const type = TAB_TO_TYPE[activeTab];
    
    // If there's unsaved content in draft, save it first
    const hasUnsavedChanges = (draft.title.trim() || draft.content.trim()) && 
                              !entries.some((note) => note.id === draft.id) &&
                              isCreatingNew;
    
    if (hasUnsavedChanges) {
      // Save current draft first, then create new one
      handleSave();
      // Wait a bit for save to complete, then create new
      setTimeout(() => {
        const newEntry = createEmptyEntry(type);
        setSelectedEntryId(null);
        setDraft(newEntry);
        setIsCreatingNew(true);
      }, 200);
    } else {
      // Just create new empty draft
      const newEntry = createEmptyEntry(type);
      setSelectedEntryId(null);
      setDraft(newEntry);
      setIsCreatingNew(true);
    }
  };

  const handleCancel = () => {
    // Cancel creating new entry - close form
    setSelectedEntryId(null);
    setIsCreatingNew(false);
    
    // If there are entries, select first one, otherwise just hide form
    const activeType = TAB_TO_TYPE[activeTab];
    const first = entries.find((entry) => (entry.type || 'note') === activeType);
    if (first) {
      setSelectedEntryId(first.id);
      setDraft({ ...first });
    }
  };

  const handleSelect = (note) => {
    setSelectedEntryId(note.id);
    setDraft({ ...note }); // Create copy to avoid mutations
    setIsCreatingNew(false);
  };

  const handleDelete = (id) => {
    // Ask for confirmation before deleting
    const noteToDelete = entries.find((note) => note.id === id);
    const noteTitle = noteToDelete?.title || 'ova beleška';
    
    if (!window.confirm(`Da li ste sigurni da želite da obrišete "${noteTitle}"?\n\nOva akcija se ne može poništiti.`)) {
      return; // User cancelled
    }
    
    const updated = entries.filter((note) => note.id !== id);
    persistEntries(updated);
    if (selectedEntryId === id) {
      const activeType = TAB_TO_TYPE[activeTab];
      const firstSameType = updated.find((entry) => (entry.type || 'note') === activeType);
      if (firstSameType) {
        setSelectedEntryId(firstSameType.id);
        setDraft({ ...firstSameType });
        setIsCreatingNew(false);
      } else {
        // No more entries, hide form
        setSelectedEntryId(null);
        setIsCreatingNew(false);
      }
    }
    toast.success('Beleška je obrisana');
  };

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSave = () => {
    if (!draft.title.trim() && !draft.content.trim()) {
      toast.error('Unesite naslov ili sadržaj beleške pre čuvanja');
      return;
    }

    // Make sure draft has proper timestamp
    const draftToSave = {
      ...draft,
      updatedAt: new Date().toISOString(),
      createdAt: draft.createdAt || new Date().toISOString()
    };

    // Check if this entry already exists in the list
    const existingIndex = entries.findIndex((note) => note.id === draftToSave.id);
    const isEditingExisting = existingIndex >= 0;
    
    let updatedEntries;
    if (isEditingExisting) {
      // Update existing entry in place (keep same position)
      updatedEntries = entries.map((note, index) => 
        index === existingIndex ? draftToSave : note
      );
    } else {
      // Add new entry to the beginning of the list
      updatedEntries = [draftToSave, ...entries];
    }

    persistEntries(updatedEntries);
    
    // Always close form after save (both for editing and creating new)
    setSelectedEntryId(null);
    setIsCreatingNew(false);
    
    toast.success('Beleška je sačuvana');
  };

  const formatTimestamp = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString('sr-RS', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredEntries = useMemo(() => {
    const activeType = TAB_TO_TYPE[activeTab];
    return entries
      .filter((entry) => (entry.type || 'note') === activeType)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [entries, activeTab]);

  const generatedNotifications = useMemo(() => {
    const now = new Date();
    const notifications = [];

    const urgentJobs = jobList.filter((job) => job.priority === 'Urgent' && job.status !== 'Completed');
    if (urgentJobs.length > 0) {
      notifications.push({
        id: 'urgent-jobs',
        title: 'Hitni poslovi',
        severity: 'high',
        message: `${urgentJobs.length} poslova je označeno kao hitno.`,
        items: urgentJobs.slice(0, 5).map((job) => `${job.clientName || 'Klijent'} – ${job.issueDescription || ''}`)
      });
    }

    const upcomingJobs = jobList.filter((job) => {
      if (!job.serviceDate) return false;
      const serviceTime = new Date(job.serviceDate).getTime();
      return serviceTime >= now.getTime() && serviceTime - now.getTime() <= 48 * 60 * 60 * 1000;
    });
    if (upcomingJobs.length > 0) {
      notifications.push({
        id: 'upcoming-jobs',
        title: 'Zakazano u naredna 2 dana',
        severity: 'medium',
        message: `${upcomingJobs.length} posete je zakazano uskoro.`,
        items: upcomingJobs.slice(0, 5).map((job) => {
          const date = new Date(job.serviceDate);
          return `${date.toLocaleString('sr-RS')} – ${job.clientName || 'Klijent'}`;
        })
      });
    }

    const pendingJobs = jobList.filter((job) => job.status === 'In Pending' || job.status === 'Received');
    if (pendingJobs.length > 0) {
      notifications.push({
        id: 'pending-jobs',
        title: 'Poslovi na čekanju',
        severity: 'low',
        message: `${pendingJobs.length} poslova još čeka dodelu ili potvrdu.`,
        items: pendingJobs.slice(0, 5).map((job) => job.clientName || job.issueDescription || 'Posao')
      });
    }

    return notifications;
  }, [jobList]);

  return (
    <div className="bg-gray-900 min-h-screen p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Notifications & Notes</h1>
            <p className="text-sm text-gray-400">Upravljajte internim beleškama i pregledajte ključna obaveštenja iz sistema.</p>
          </div>
          <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'notes' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('notes')}
            >
              Beleške
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              Obaveštenja
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <aside className="lg:col-span-4 bg-gray-800/80 border border-gray-700 rounded-xl shadow-lg flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {activeTab === 'notes' ? 'Beleške' : 'Obaveštenja od sistema'}
                </h2>
                <p className="text-xs text-gray-400">
                  {activeTab === 'notes'
                    ? 'Brzo zabeležite informacije i ideje'
                    : 'Globalna obaveštenja poslata od strane administracije'}
                </p>
              </div>
              {activeTab === 'notes' && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Novo
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'notifications' ? (
                // Show global notifications from server
                <>
                  {loadingGlobalNotifications ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : globalNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-gray-400 py-10 px-6">
                      <p className="text-sm">Nema obaveštenja od sistema.</p>
                      <p className="text-xs text-gray-500 mt-1">Obaveštenja će se prikazati ovde kada budu poslata.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-700">
                      {globalNotifications.filter(n => !hiddenNotifications[n._id]).map((notification) => (
                        <li key={notification._id}>
                          <button
                            onClick={() => {
                              setSelectedEntryId(`global-${notification._id}`);
                              setDraft({
                                id: `global-${notification._id}`,
                                title: notification.title,
                                content: notification.message,
                                type: 'notification',
                                createdAt: notification.createdAt,
                                updatedAt: notification.createdAt
                              });
                            }}
                            className={`w-full text-left px-4 py-3 transition-colors ${
                              selectedEntryId === `global-${notification._id}` ? 'bg-blue-500/10 border-l-4 border-blue-500' : 'hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-white truncate">
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  notification.type === 'info' ? 'bg-blue-500/20 text-blue-300' :
                                  notification.type === 'success' ? 'bg-green-500/20 text-green-300' :
                                  notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-red-500/20 text-red-300'
                                }`}>
                                  {notification.type}
                                </span>
                                {notificationInterest[notification._id] === 'interested' && (
                                  <span className="text-emerald-400 text-xs">Zanima me</span>
                                )}
                                {notificationInterest[notification._id] === 'not_interested' && (
                                  <span className="text-gray-400 text-xs">Ne zanima</span>
                                )}
                                <span className="text-xs text-gray-400 ml-2">
                                  {formatTimestamp(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            {notification.message && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                // Show local notes
                <>
                  {filteredEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-gray-400 py-10 px-6">
                      <p className="text-sm">Još uvek nema zapisa u ovoj kategoriji.</p>
                      <p className="text-xs text-gray-500 mt-1">Kliknite na Novo da biste dodali prvi zapis.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-700">
                      {filteredEntries.map((entry) => (
                        <li key={entry.id}>
                          <div className={`px-4 py-3 transition-colors ${entry.id === selectedEntryId ? 'bg-blue-500/10 border-l-4 border-blue-500' : 'hover:bg-gray-700'}`}>
                            <div className="flex items-center justify-between gap-2">
                              <button onClick={() => handleSelect(entry)} className="text-left flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-semibold text-white truncate">
                                    {entry.title || 'Bez naslova'}
                                  </h3>
                                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                    Interna beleška
                                  </span>
                                </div>
                                {entry.content && (
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {entry.content}
                                  </p>
                                )}
                              </button>
                              <div className="flex items-center gap-2">
                                <button
                                  title="Uredi"
                                  onClick={() => handleSelect(entry)}
                                  className="p-1.5 rounded hover:bg-gray-600/50 text-gray-300 hover:text-white"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  title="Obriši"
                                  onClick={() => handleDelete(entry.id)}
                                  className="p-1.5 rounded hover:bg-red-600/20 text-red-400 hover:text-red-300"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">{formatTimestamp(entry.updatedAt)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </aside>

          <section className="lg:col-span-8 bg-gray-800/80 border border-gray-700 rounded-xl shadow-lg p-4 sm:p-6">
            {((selectedEntryId || isCreatingNew) && activeTab === 'notes') || 
             (selectedEntryId && selectedEntryId.startsWith('global-')) ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-400">Kreirano: {formatTimestamp(draft.createdAt)}</p>
                    <p className="text-xs text-gray-500">Ažurirano: {formatTimestamp(draft.updatedAt)}</p>
                  </div>
                  {selectedEntryId && !selectedEntryId.startsWith('global-') && (
                    <button
                      onClick={() => handleDelete(selectedEntryId)}
                      className="inline-flex items-center gap-1 text-sm px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      Obriši
                    </button>
                  )}
                </div>

                {!selectedEntryId?.startsWith('global-') && activeTab === 'notes' ? (
                  <>
                    <input
                      type="text"
                      value={draft.title || ''}
                      onChange={(event) => handleFieldChange('title', event.target.value)}
                      placeholder="Naslov beleške"
                      className="w-full bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2 text-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <textarea
                      value={draft.content || ''}
                      onChange={(event) => handleFieldChange('content', event.target.value)}
                      placeholder="Sadržaj beleške..."
                      rows={10}
                      className="flex-1 bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex justify-end gap-2">
                      {isCreatingNew && (
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Otkaži
                        </button>
                      )}
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Save size={16} />
                        Sačuvaj
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-900/80 border border-gray-700 rounded-lg px-4 py-3">
                      <h2 className="text-lg font-semibold text-white mb-2">{draft.title}</h2>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{draft.content}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xs text-gray-500">
                        Ovo je globalno obaveštenje od strane administracije. Ne možete ga uređivati.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const updated = { ...notificationInterest, [draft.id.replace('global-','')]: 'interested' };
                            persistInterest(updated);
                            toast.success('Obeleženo kao: Interesuje me');
                          }}
                          className={`px-3 py-1.5 rounded text-sm ${
                            notificationInterest[draft.id?.replace('global-','')] === 'interested'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                          }`}
                        >
                          Interesuje me
                        </button>
                        <button
                          onClick={() => {
                            const notifId = draft.id.replace('global-','');
                            const updatedHidden = { ...hiddenNotifications, [notifId]: true };
                            persistHidden(updatedHidden);
                            toast.info('Obaveštenje više neće biti prikazivano');
                            // Close the form and refresh
                            setSelectedEntryId(null);
                            setGlobalNotifications(prev => prev.filter(n => n._id !== notifId));
                          }}
                          className="px-3 py-1.5 rounded text-sm bg-red-600/20 text-red-300 hover:bg-red-600/30"
                        >
                          Ne prikazuj ovo obaveštenje
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : activeTab === 'notifications' ? (
              // Show notifications overview when on notifications tab and nothing selected
              <div className="space-y-4">
                <div className="border-b border-gray-700 pb-4">
                  <h2 className="text-xl font-semibold text-white mb-2">Globalna obaveštenja</h2>
                  <p className="text-sm text-gray-400">
                    Obaveštenja poslata od strane administracije platforme
                  </p>
                </div>
                
                {globalNotifications.filter(n => !hiddenNotifications[n._id]).length === 0 && !loadingGlobalNotifications ? (
                  <div className="text-center py-10">
                    <p className="text-gray-400">Nema globalnih obaveštenja.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {globalNotifications
                      .filter(n => !hiddenNotifications[n._id])
                      .map((notification) => (
                      <div
                        key={notification._id}
                        className="bg-gray-900/80 border border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
                            <div className="flex items-center gap-2 mt-2 mb-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                notification.type === 'info' ? 'bg-blue-500/20 text-blue-300' :
                                notification.type === 'success' ? 'bg-green-500/20 text-green-300' :
                                notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {notification.type}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(notification.createdAt)}
                              </span>
                              {notificationInterest[notification._id] === 'interested' && (
                                <span className="text-xs text-emerald-400">✓ Interesuje me</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() => {
                                  const updated = { ...notificationInterest, [notification._id]: 'interested' };
                                  persistInterest(updated);
                                  toast.success('Obeleženo kao: Interesuje me');
                                }}
                                className={`px-3 py-1.5 rounded text-sm text-xs ${
                                  notificationInterest[notification._id] === 'interested'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                                }`}
                              >
                                Interesuje me
                              </button>
                              <button
                                onClick={() => {
                                  const updatedHidden = { ...hiddenNotifications, [notification._id]: true };
                                  persistHidden(updatedHidden);
                                  setGlobalNotifications(prev => prev.filter(n => n._id !== notification._id));
                                  toast.info('Obaveštenje više neće biti prikazivano');
                                }}
                                className="px-3 py-1.5 rounded text-sm text-xs bg-red-600/20 text-red-300 hover:bg-red-600/30"
                              >
                                Ne prikazuj ovo obaveštenje
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Show empty state for notes tab
              <div className="flex flex-col items-center justify-center text-center text-gray-400 h-full py-10">
                <p className="text-sm">
                  {filteredEntries.length === 0
                    ? 'Još uvek nema zapisa. Kliknite na "Novo" da biste dodali prvi zapis.'
                    : 'Izaberite zapis iz liste ili dodajte novi kako biste ga uredili.'}
                </p>
                <button
                  onClick={handleCreate}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus size={16} />
                  Dodaj zapis
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;

