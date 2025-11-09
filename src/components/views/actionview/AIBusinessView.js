import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Brain, Lightbulb, Rocket, Target, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAIBusinessIdeas, fetchClients, respondToAIBusinessIdea } from '../../../redux/api';

const phaseOrder = ['Strategija', 'Marketinške aktivnosti', 'Prodaja', 'Operativa', 'Automatizacija', 'Analitika', 'Druge faze'];

const groupIdeasByPhase = (ideas = []) => {
  const map = {};
  ideas.forEach((idea) => {
    const phase = idea.phase?.trim() || 'Druge faze';
    if (!map[phase]) {
      map[phase] = [];
    }
    map[phase].push(idea);
  });

  const sortedPhases = Object.keys(map).sort((a, b) => {
    const idxA = phaseOrder.indexOf(a);
    const idxB = phaseOrder.indexOf(b);
    return (idxA === -1 ? Number.MAX_SAFE_INTEGER : idxA) - (idxB === -1 ? Number.MAX_SAFE_INTEGER : idxB);
  });

  return sortedPhases.map((phase) => ({
    phase,
    ideas: map[phase].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
  }));
};

const formatActions = (actionSteps = [], formatFn = (value) => value) => {
  if (!actionSteps.length) {
    return null;
  }
  return (
    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-100">
      {actionSteps.map((step, index) => (
        <li key={`${step}-${index}`} className="leading-relaxed">
          {formatFn(step)}
        </li>
      ))}
    </ul>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AIBusinessView = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.result?.role || user?.role || '';
  const isSuperAdmin = role === 'superadmin';

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState('');
  const [clientCount, setClientCount] = useState(null);
  const [respondingIdeaId, setRespondingIdeaId] = useState(null);

  const phases = useMemo(() => groupIdeasByPhase(ideas), [ideas]);

  const formatClientLabel = useCallback((count) => {
    if (count === null) {
      return '0 klijenata';
    }
    const absCount = Math.abs(count);
    if (absCount === 1) {
      return `${count} klijent`;
    }
    const lastTwoDigits = absCount % 100;
    const lastDigit = absCount % 10;
    if (lastTwoDigits >= 12 && lastTwoDigits <= 14) {
      return `${count} klijenata`;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${count} klijenta`;
    }
    return `${count} klijenata`;
  }, []);

  const applyDynamicText = useCallback(
    (text) => {
      if (!text) return text;
      let result = text;

      if (clientCount !== null) {
        const clientLabel = formatClientLabel(clientCount);
        result = result.replace(/\{\s*iz\s*baze\s*\}\s*klijenata/gi, clientLabel);
        result = result.replace(/\{\{\s*clientCount\s*\}\}/gi, String(clientCount));
        result = result.replace(/\{\{\s*clientCountLabel\s*\}\}/gi, clientLabel);
        result = result.replace(/\{\s*clientCount\s*\}/gi, String(clientCount));
        result = result.replace(/\{\s*clientCountLabel\s*\}/gi, clientLabel);
        result = result.replace(/\{\s*iz\s*baze\s*\}/gi, clientLabel);

        result = result.replace(/\(\s*0\s+klijen[ataei]+\b([^)]*)\)/gi, (_match, rest) => `(${clientLabel}${rest || ''})`);
        result = result.replace(/\b0\s+klijen[ataei]+\b/gi, clientLabel);
      }

      return result;
    },
    [clientCount, formatClientLabel]
  );

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        setLoading(true);
        const ideasPromise = fetchAIBusinessIdeas();
        const clientsPromise = isSuperAdmin ? Promise.resolve(null) : fetchClients();

        const [ideasResult, clientsResult] = await Promise.allSettled([ideasPromise, clientsPromise]);

        if (ideasResult.status === 'fulfilled') {
          const data = Array.isArray(ideasResult.value?.data) ? ideasResult.value.data : [];
          setIdeas(data);
          if (data.length > 0) {
            setExpandedPhase(data[0].phase || 'Druge faze');
          }
        } else {
          console.error('Greška pri učitavanju AI biznis ideja:', ideasResult.reason);
          toast.error('Ne možemo da učitamo AI biznis smernice. Proveri vezu sa serverom.');
        }

        if (!isSuperAdmin && clientsResult.status === 'fulfilled') {
          const clientsData = Array.isArray(clientsResult.value?.data) ? clientsResult.value.data : [];
          setClientCount(clientsData.length);
        } else if (!isSuperAdmin && clientsResult.status === 'rejected') {
          console.warn('Ne možemo da učitamo listu klijenata za AI smernice:', clientsResult.reason);
        }
      } catch (error) {
        console.error('Greška pri učitavanju AI biznis ideja:', error);
        toast.error('Ne možemo da učitamo AI biznis smernice. Proveri vezu sa serverom.');
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
  }, [isSuperAdmin]);

  const handleIdeaResponse = useCallback(
    async (ideaId, status) => {
      if (isSuperAdmin) return;

      try {
        setRespondingIdeaId(`${ideaId}-${status}`);
        const { data } = await respondToAIBusinessIdea({ id: ideaId, status });

        setIdeas((prevIdeas) =>
          prevIdeas.map((idea) =>
            idea.id === ideaId
              ? {
                  ...idea,
                  userResponse: {
                    status: data.status,
                    updatedAt: data.updatedAt,
                  },
                  responsesSummary: data.summary || idea.responsesSummary,
                }
              : idea
          )
        );

        toast.success(
          status === 'accepted'
            ? 'Hvala! Evidentirali smo da pokrećeš ovu fazu.'
            : 'Razumemo, zabeležili smo da trenutno preskačeš ovu fazu.'
        );
      } catch (error) {
        console.error('Greška pri slanju odgovora za AI biznis ideju:', error);
        const message = error.response?.data?.message || 'Ne možemo da sačuvamo odgovor. Pokušaj ponovo.';
        toast.error(message);
      } finally {
        setRespondingIdeaId(null);
      }
    },
    [isSuperAdmin]
  );

  const renderUserResponse = (idea) => {
    if (isSuperAdmin) return null;

    const currentStatus = idea.userResponse?.status;
    const statusLabel =
      currentStatus === 'accepted'
        ? 'Pokrećemo ovu fazu'
        : currentStatus === 'declined'
        ? 'Za sada preskačemo ovu fazu'
        : 'Nije odlučeno';

    const isAccepting = respondingIdeaId === `${idea.id}-accepted`;
    const isDeclining = respondingIdeaId === `${idea.id}-declined`;

    return (
      <div className="bg-slate-800/70 border border-emerald-600/30 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm text-slate-200">
            <span className="font-semibold text-white">Tvoj status:</span> {statusLabel}
            {idea.userResponse?.updatedAt && (
              <span className="block text-xs text-slate-400">
                Ažurirano: {formatDate(idea.userResponse.updatedAt)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleIdeaResponse(idea.id, 'accepted')}
              disabled={isAccepting}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                currentStatus === 'accepted'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30'
              } ${isAccepting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <CheckCircle className="h-4 w-4" />
              Pokrećemo fazu
            </button>
            <button
              type="button"
              onClick={() => handleIdeaResponse(idea.id, 'declined')}
              disabled={isDeclining}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                currentStatus === 'declined'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-500/10 text-red-200 border border-red-500/40 hover:bg-red-500/20'
              } ${isDeclining ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <XCircle className="h-4 w-4" />
              Još ne krećemo
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResponsesSummary = (idea) => {
    if (!isSuperAdmin || !idea.responsesSummary) return null;

    const { acceptedCount, declinedCount, accepted, declined } = idea.responsesSummary;

    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3 text-xs sm:text-sm text-slate-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-300" />
            <span className="font-semibold text-emerald-200">Pokreću: {acceptedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-300" />
            <span className="font-semibold text-red-200">Preskaču: {declinedCount}</span>
          </div>
        </div>

        {(accepted.length > 0 || declined.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accepted.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-emerald-300 mb-2">Pokreću</p>
                <ul className="space-y-1">
                  {accepted.map((entry) => (
                    <li
                      key={`${idea.id}-accepted-${entry.companyId}`}
                      className="flex items-center justify-between gap-2 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2"
                    >
                      <span className="font-medium text-slate-100">{entry.companyName}</span>
                      <span className="text-[11px] text-slate-400">{formatDate(entry.respondedAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {declined.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-red-300 mb-2">Za sada preskaču</p>
                <ul className="space-y-1">
                  {declined.map((entry) => (
                    <li
                      key={`${idea.id}-declined-${entry.companyId}`}
                      className="flex items-center justify-between gap-2 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2"
                    >
                      <span className="font-medium text-slate-100">{entry.companyName}</span>
                      <span className="text-[11px] text-slate-400">{formatDate(entry.respondedAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-4 sm:px-6 py-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/70 rounded-2xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-full border border-emerald-400/40">
                  <Brain className="h-7 w-7 text-emerald-300" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Biznis</h1>
                  <p className="text-sm sm:text-base text-emerald-100/90">
                    Praktične biznis ideje koje možemo pokrenuti odmah, uz AI asistenciju koja ubrzava svaki korak.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3">
                  <Lightbulb className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Ideje sa dokazanim potencijalom</p>
                    <p className="text-slate-300">Svaka faza sadrži konkretne AI korake.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3">
                  <Rocket className="h-5 w-5 text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Brza implementacija</p>
                    <p className="text-slate-300">Od ideje do testirane ponude za manje od nedelju dana.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3">
                  <Target className="h-5 w-5 text-sky-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">AI asistencija po fazama</p>
                    <p className="text-slate-300">Savet i alati u svakom koraku procesa.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
          </div>
        ) : phases.length === 0 ? (
          <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-8 text-center text-sm text-slate-300">
            Još uvek nema definisanih AI biznis smernica. Kontaktiraj superadmin tim da se dodaju prve ideje.
          </div>
        ) : (
          <div className="space-y-5">
            {phases.map(({ phase, ideas: phaseIdeas }) => {
              const isExpanded = expandedPhase === phase;
              return (
                <section key={phase} className="bg-slate-900/80 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                  <button
                    type="button"
                    onClick={() => setExpandedPhase(isExpanded ? '' : phase)}
                    className="w-full flex items-center justify-between px-4 sm:px-6 py-4 bg-slate-800/70 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-white">{phase}</h2>
                        <p className="text-xs sm:text-sm text-slate-300">{phaseIdeas.length} ideja spremnih za implementaciju</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 rounded-full px-3 py-1">
                      AI vodič
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-slate-800">
                      {phaseIdeas.map((idea) => (
                        <article key={idea.id} className="p-4 sm:p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="text-xl font-semibold text-white">{idea.title}</h3>
                              {idea.summary && <p className="text-sm text-slate-200 max-w-3xl">{applyDynamicText(idea.summary)}</p>}
                            </div>
                            <div className="text-xs text-slate-400 text-right sm:text-left">
                              <p className="uppercase tracking-wide text-slate-500">Poslednja izmena</p>
                              <p>{formatDate(idea.updatedAt)}</p>
                            </div>
                          </div>

                          {idea.actionSteps?.length > 0 && (
                            <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                              <p className="text-xs font-semibold uppercase text-slate-300 mb-2">Koraci za primenu</p>
                              {formatActions(idea.actionSteps, applyDynamicText)}
                            </div>
                          )}

                          {(idea.aiAssist || idea.impact || idea.resources) && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {idea.aiAssist && (
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-xs sm:text-sm text-blue-100">
                                  <p className="font-semibold text-blue-200 mb-1">AI asistencija</p>
                                  <p className="leading-relaxed">{applyDynamicText(idea.aiAssist)}</p>
                                </div>
                              )}
                              {idea.impact && (
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-xs sm:text-sm text-purple-100">
                                  <p className="font-semibold text-purple-200 mb-1">Očekivani uticaj</p>
                                  <p className="leading-relaxed">{applyDynamicText(idea.impact)}</p>
                                </div>
                              )}
                              {idea.resources && (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-xs sm:text-sm text-emerald-100">
                                  <p className="font-semibold text-emerald-200 mb-1">Resursi / alati</p>
                                  <p className="leading-relaxed">{applyDynamicText(idea.resources)}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {idea.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                              {idea.tags.map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {renderUserResponse(idea)}
                          {renderResponsesSummary(idea)}
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIBusinessView;


