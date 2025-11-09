import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Calendar,
  Users,
  Briefcase,
  CheckCircle,
  UserCheck,
  Radio,
  Wrench,
  FolderArchive,
  Package,
  ShoppingCart,
  ArrowDown,
  ArrowUp,
  ClipboardList,
  Calculator,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  MapPin,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  Send,
  Zap,
  Brain,
  Store,
  TrendingUp,
  Database,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const TutorialsView = () => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: 'dashboard',
      icon: <BarChart3 className="h-6 w-6" />,
      title: t('tutorials.dashboard.title', 'Dashboard - Pregled'),
      description: t('tutorials.dashboard.description', 'Glavna tablica sa pregledom svih vaših aktivnosti'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">{t('tutorials.dashboard.intro', 'Dashboard je vaš početni ekran koji vam pruža brz pregled svih aktivnosti. Odatle možete brzo pristupiti svim sekcijama aplikacije.')}</p>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">{t('tutorials.dashboard.features', 'Ključne funkcionalnosti:')}</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.dashboard.feature1', 'Pregled statistika poslova')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.dashboard.feature2', 'Brzi pristup svim sekcijama')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.dashboard.feature3', 'Pregled zakazanih poslova')}</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'jobs',
      icon: <Briefcase className="h-6 w-6" />,
      title: t('tutorials.jobs.title', 'Poslovi - Upravljanje poslovima'),
      description: t('tutorials.jobs.description', 'Kreiranje, zakazivanje i upravljanje poslovima'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">{t('tutorials.jobs.intro', 'Sekcija Poslovi je srce vaše aplikacije. Odatle upravljate svim servisnim poslovima.')}</p>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('tutorials.jobs.calendar', 'Kalendarski pregled')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.jobs.calendarDesc', 'Kalendar vam omogućava da vidite sve zakazane poslove po danima, nedeljama ili mesecima. Moguće je povlačiti i spuštati poslove za promenu zakazivanja.')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="bg-gray-800 rounded p-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Clock className="h-3 w-3" />
                  {t('tutorials.jobs.timeSlot', 'Vremenski slot')}
                </div>
                <p className="text-white text-sm">{t('tutorials.jobs.timeSlotDesc', 'Klikom na prazan vremenski slot možete kreirati novi posao')}</p>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Edit className="h-3 w-3" />
                  {t('tutorials.jobs.edit', 'Uređivanje')}
                </div>
                <p className="text-white text-sm">{t('tutorials.jobs.editDesc', 'Povlačenjem poslova menjate njihovo zakazivanje')}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {t('tutorials.jobs.queue', 'Red čekanja')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.jobs.queueDesc', 'Red čekanja prikazuje sve nezakazane poslove. Ovi poslovi nemaju određeno vreme i mogu se zakazati po potrebi.')}</p>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.jobs.queueFeature1', 'Pregled svih nezakazanih poslova')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.jobs.queueFeature2', 'Mogućnost promene prioriteta')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.jobs.queueFeature3', 'Brzo zakazivanje iz reda čekanja')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t('tutorials.jobs.create', 'Kreiranje novog posla')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.jobs.createDesc', 'Novi posao se kreira popunjavanjem forme sa sledećim podacima:')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="bg-gray-800 rounded p-3">
                <div className="text-gray-400 text-xs mb-1">{t('tutorials.jobs.clientInfo', 'Podaci o klijentu')}</div>
                <ul className="text-white text-xs space-y-1">
                  <li>• {t('tutorials.jobs.clientName', 'Ime klijenta')}</li>
                  <li>• {t('tutorials.jobs.clientPhone', 'Telefon')}</li>
                  <li>• {t('tutorials.jobs.clientAddress', 'Adresa')}</li>
                </ul>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <div className="text-gray-400 text-xs mb-1">{t('tutorials.jobs.jobInfo', 'Podaci o poslu')}</div>
                <ul className="text-white text-xs space-y-1">
                  <li>• {t('tutorials.jobs.issueDesc', 'Opis problema')}</li>
                  <li>• {t('tutorials.jobs.priority', 'Prioritet')}</li>
                  <li>• {t('tutorials.jobs.assignedTo', 'Dodeljeno radniku')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'status',
      icon: <Radio className="h-6 w-6" />,
      title: t('tutorials.status.title', 'Status - Dispečerski centar'),
      description: t('tutorials.status.description', 'Praćenje statusa radnika i poslova u realnom vremenu'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">{t('tutorials.status.intro', 'Dispečerski centar vam daje uvid u trenutno stanje svih radnika i aktivnih poslova.')}</p>
          
          <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
            <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              {t('tutorials.status.workers', 'Praćenje radnika')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.status.workersDesc', 'Svaki radnik ima status badge koji pokazuje trenutno stanje:')}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-green-900/30 rounded p-2 text-center">
                <div className="text-green-400 text-xs font-semibold mb-1">{t('tutorials.status.available', 'Dostupan')}</div>
                <div className="text-gray-300 text-xs">{t('tutorials.status.availableDesc', 'Slobodan za nove poslove')}</div>
              </div>
              <div className="bg-blue-900/30 rounded p-2 text-center">
                <div className="text-blue-400 text-xs font-semibold mb-1">{t('tutorials.status.scheduled', 'Zakazan')}</div>
                <div className="text-gray-300 text-xs">{t('tutorials.status.scheduledDesc', 'Ima zakazane poslove')}</div>
              </div>
              <div className="bg-purple-900/30 rounded p-2 text-center">
                <div className="text-purple-400 text-xs font-semibold mb-1">{t('tutorials.status.inService', 'U servisu')}</div>
                <div className="text-gray-300 text-xs">{t('tutorials.status.inServiceDesc', 'Radi u radionici')}</div>
              </div>
              <div className="bg-orange-900/30 rounded p-2 text-center">
                <div className="text-orange-400 text-xs font-semibold mb-1">{t('tutorials.status.atClient', 'Kod stranke')}</div>
                <div className="text-gray-300 text-xs">{t('tutorials.status.atClientDesc', 'Na terenu kod klijenta')}</div>
              </div>
              <div className="bg-red-900/30 rounded p-2 text-center">
                <div className="text-red-400 text-xs font-semibold mb-1">{t('tutorials.status.offline', 'Offline')}</div>
                <div className="text-gray-300 text-xs">{t('tutorials.status.offlineDesc', 'Nedostupan')}</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('tutorials.status.liveClock', 'Live sat')}
            </h4>
            <p className="text-gray-300 text-sm">{t('tutorials.status.liveClockDesc', 'Real-time sat prikazuje trenutno vreme i datum, kao i broj aktivnih poslova. Ažurira se automatski svakog minuta.')}</p>
          </div>
        </div>
      )
    },
    {
      id: 'clients',
      icon: <Users className="h-6 w-6" />,
      title: t('tutorials.clients.title', 'Klijenti - Upravljanje klijentima'),
      description: t('tutorials.clients.description', 'Kreiranje i upravljanje bazom klijenata'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">{t('tutorials.clients.intro', 'Sekcija Klijenti vam omogućava da vodite detaljnu bazu svih vaših klijenata.')}</p>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t('tutorials.clients.create', 'Dodavanje novog klijenta')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.clients.createDesc', 'Klikom na dugme "Dodaj klijenta" otvara se forma za unos:')}</p>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.clients.field1', 'Ime klijenta - obavezno polje')}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.clients.field2', 'Telefon - obavezno polje')}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.clients.field3', 'Adresa (ulica, broj, sprat, stan)')}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.clients.field4', 'Email - opciono')}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.clients.field5', 'Opis - dodatne napomene')}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('tutorials.clients.history', 'Istorija servisa')}
            </h4>
            <p className="text-gray-300 text-sm">{t('tutorials.clients.historyDesc', 'Klikom na ikonu istorije pored imena klijenta, otvara se modal sa kompletnom istorijom svih poslova vezanih za tog klijenta. Vidite datum, opis problema, status i dodeljenog radnika.')}</p>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('tutorials.clients.search', 'Pretraga i sortiranje')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.clients.searchDesc', 'Možete pretraživati klijente po imenu, telefonu ili email adresi. Klijenti se automatski sortiraju po abecednom redu.')}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-gray-800 rounded px-3 py-2 flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">{t('tutorials.clients.edit', 'Uredi')}</span>
              </div>
              <div className="bg-gray-800 rounded px-3 py-2 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-400" />
                <span className="text-gray-300">{t('tutorials.clients.delete', 'Obriši')}</span>
              </div>
            </div>
          </div>

          {t('tutorials.clients.packageLimit', 'Važno: Free paket ima limit od 100 adresa mesečno. Status limita možete videti u header-u sekcije.') && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">{t('tutorials.clients.packageLimitTitle', 'Limit paketa')}</span>
              </div>
              <p className="text-gray-300 text-sm">{t('tutorials.clients.packageLimit', 'Free paket ima limit od 100 adresa mesečno. Status limita možete videti u header-u sekcije.')}</p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'workers',
      icon: <UserCheck className="h-6 w-6" />,
      title: t('tutorials.workers.title', 'Radnici - Upravljanje timom'),
      description: t('tutorials.workers.description', 'Upravljanje radnicima, timovima i dozvolama'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">{t('tutorials.workers.intro', 'Sekcija Radnici vam omogućava da upravljate svojim timom i dodeljujete poslove.')}</p>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t('tutorials.workers.add', 'Dodavanje radnika')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.workers.addDesc', 'Novi radnik se dodaje sa sledećim podacima:')}</p>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.workers.field1', 'Ime i prezime')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.workers.field2', 'Email i telefon')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.workers.field3', 'Specijalizacija')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('tutorials.workers.teams', 'Timovi')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.workers.teamsDesc', 'Možete kreirati timove i dodeljivati radnike timovima. Ovo je korisno za grupisanje radnika po specijalizaciji ili lokaciji.')}</p>
            <div className="bg-gray-800 rounded p-3 mt-3">
              <p className="text-gray-400 text-xs mb-2">{t('tutorials.workers.teamCreation', 'Kreiranje tima:')}</p>
              <ol className="space-y-1 text-gray-300 text-xs ml-4 list-decimal">
                <li>{t('tutorials.workers.step1', 'Kliknite na "Dodaj tim"')}</li>
                <li>{t('tutorials.workers.step2', 'Unesite naziv tima')}</li>
                <li>{t('tutorials.workers.step3', 'Izaberite radnike za tim (checkbox-ovi)')}</li>
                <li>{t('tutorials.workers.step4', 'Sačuvaj tim')}</li>
              </ol>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'inventory',
      icon: <Package className="h-6 w-6" />,
      title: t('tutorials.inventory.title', 'Magacin - Upravljanje zalihama'),
      description: t('tutorials.inventory.description', 'Kompletno upravljanje zalihama, ulazima, izlazima i kalkulacijama'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">{t('tutorials.inventory.intro', 'Sekcija Magacin omogućava vam potpuno upravljanje zalihama, ulazima robe, izlazima, carinskim deklaracijama i finansijskim kalkulacijama.')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-blue-400" />
                <h4 className="font-semibold text-blue-400">{t('tutorials.inventory.items', 'Artikli')}</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">{t('tutorials.inventory.itemsDesc', 'Pregled i upravljanje svim artiklima u magacinu. Dodavanje novih artikala, uređivanje cena, praćenje zaliha.')}</p>
              <ul className="space-y-1 text-gray-400 text-xs">
                <li>• {t('tutorials.inventory.itemsFeature1', 'Šifra i naziv artikla')}</li>
                <li>• {t('tutorials.inventory.itemsFeature2', 'Kategorija i jedinica mere')}</li>
                <li>• {t('tutorials.inventory.itemsFeature3', 'Nabavna i prodajna cena')}</li>
                <li>• {t('tutorials.inventory.itemsFeature4', 'Trenutna i minimalna zaliha')}</li>
              </ul>
            </div>

            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowDown className="h-5 w-5 text-green-400" />
                <h4 className="font-semibold text-green-400">{t('tutorials.inventory.inputs', 'Ulazi robe')}</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">{t('tutorials.inventory.inputsDesc', 'Registracija ulaza robe u magacin. Povezivanje sa poslovima, unosenje dokumenta, cena i količina.')}</p>
              <ul className="space-y-1 text-gray-400 text-xs">
                <li>• {t('tutorials.inventory.inputsFeature1', 'Broj dokumenta')}</li>
                <li>• {t('tutorials.inventory.inputsFeature2', 'Datum ulaza')}</li>
                <li>• {t('tutorials.inventory.inputsFeature3', 'Povezivanje sa poslom')}</li>
                <li>• {t('tutorials.inventory.inputsFeature4', 'Carinski troškovi')}</li>
              </ul>
            </div>

            <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUp className="h-5 w-5 text-orange-400" />
                <h4 className="font-semibold text-orange-400">{t('tutorials.inventory.outputs', 'Izlazi robe')}</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">{t('tutorials.inventory.outputsDesc', 'Registracija izlaza robe iz magacina. Možete povezati sa poslom ili izdati za druge razloge.')}</p>
              <ul className="space-y-1 text-gray-400 text-xs">
                <li>• {t('tutorials.inventory.outputsFeature1', 'Povezivanje sa poslom')}</li>
                <li>• {t('tutorials.inventory.outputsFeature2', 'Razlog izdavanja')}</li>
                <li>• {t('tutorials.inventory.outputsFeature3', 'Validacija dostupne količine')}</li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="h-5 w-5 text-yellow-400" />
                <h4 className="font-semibold text-yellow-400">{t('tutorials.inventory.withdrawn', 'Povučena roba')}</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">{t('tutorials.inventory.withdrawnDesc', 'Roba povučena za specifične poslove. Rezervacija, izdavanje i vraćanje robe.')}</p>
              <div className="flex gap-2 text-xs">
                <span className="bg-gray-700 px-2 py-1 rounded text-gray-300">{t('tutorials.inventory.reserved', 'Rezervisano')}</span>
                <span className="bg-gray-700 px-2 py-1 rounded text-gray-300">{t('tutorials.inventory.issued', 'Izdata')}</span>
                <span className="bg-gray-700 px-2 py-1 rounded text-gray-300">{t('tutorials.inventory.returned', 'Vraćeno')}</span>
              </div>
            </div>

            <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-purple-400" />
                <h4 className="font-semibold text-purple-400">{t('tutorials.inventory.customs', 'Carina')}</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">{t('tutorials.inventory.customsDesc', 'Upravljanje carinskim deklaracijama za uvezenu robu. Kalkulacije carine i PDV-a.')}</p>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5 text-indigo-400" />
                <h4 className="font-semibold text-indigo-400">{t('tutorials.inventory.calculations', 'Kalkulacije')}</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">{t('tutorials.inventory.calculationsDesc', 'Finansijske kalkulacije i izveštaji. Vrednovanje zaliha, PDV kalkulacije, marže. Export u CSV.')}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      icon: <MessageSquare className="h-6 w-6" />,
      title: t('tutorials.notifications.title', 'Obaveštenja - Beleške i obaveštenja'),
      description: t('tutorials.notifications.description', 'Lične beleške i sistemska obaveštenja'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">{t('tutorials.notifications.intro', 'Sekcija Obaveštenja ima dve kartice: Beleške za lične beleške i Obaveštenja za sistemska obaveštenja.')}</p>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('tutorials.notifications.notes', 'Beleške')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.notifications.notesDesc', 'Vaše lične beleške koje se čuvaju lokalno u vašem pregledaču. Korisno za brze zapise, podseste i lične napomene.')}</p>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <Plus className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.notifications.createNote', 'Kreiranje nove beleške - kliknite "Dodaj belešku"')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Edit className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.notifications.editNote', 'Uređivanje - kliknite ikonu olovke')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Trash2 className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span>{t('tutorials.notifications.deleteNote', 'Brisanje - kliknite ikonu kante (sa potvrdom)')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t('tutorials.notifications.notifications', 'Obaveštenja')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.notifications.notificationsDesc', 'Sistemska obaveštenja koja dobijate od administratora. Možete označiti da vas interesuje ili sakriti obaveštenje.')}</p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-gray-800 rounded p-3 text-center">
                <div className="text-green-400 text-xs font-semibold mb-1">{t('tutorials.notifications.interested', 'Interesuje me')}</div>
                <div className="text-gray-400 text-xs">{t('tutorials.notifications.interestedDesc', 'Označite ako želite da pratite')}</div>
              </div>
              <div className="bg-gray-800 rounded p-3 text-center">
                <div className="text-red-400 text-xs font-semibold mb-1">{t('tutorials.notifications.hide', 'Sakrij')}</div>
                <div className="text-gray-400 text-xs">{t('tutorials.notifications.hideDesc', 'Ne prikazuj ovo obaveštenje')}</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'company',
      icon: <Settings className="h-6 w-6" />,
      title: t('tutorials.company.title', 'Kompanija - Postavke i podaci'),
      description: t('tutorials.company.description', 'Podaci o kompaniji i postavke'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">{t('tutorials.company.intro', 'Sekcija Kompanija sadrži podatke o vašoj kompaniji i postavke sistema.')}</p>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t('tutorials.company.info', 'Podaci o kompaniji')}
            </h4>
            <p className="text-gray-300 text-sm mb-3">{t('tutorials.company.infoDesc', 'Možete uneti i ažurirati sledeće podatke:')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded p-2">
                <div className="text-gray-400 text-xs">{t('tutorials.company.field1', 'Naziv kompanije')}</div>
              </div>
              <div className="bg-gray-800 rounded p-2">
                <div className="text-gray-400 text-xs">{t('tutorials.company.field2', 'PIB')}</div>
              </div>
              <div className="bg-gray-800 rounded p-2">
                <div className="text-gray-400 text-xs">{t('tutorials.company.field3', 'Žiro račun')}</div>
              </div>
              <div className="bg-gray-800 rounded p-2">
                <div className="text-gray-400 text-xs">{t('tutorials.company.field4', 'Telefon i email')}</div>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('tutorials.company.magacin', 'Magacin i zaliha')}
            </h4>
            <p className="text-gray-300 text-sm">{t('tutorials.company.magacinDesc', 'Kompletno upravljanje zalihama preko podsekcije Magacin. Vidite detaljne podatke u sekciji Magacin iznad.')}</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-green-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-500/20 rounded-lg p-4">
              <BookOpen className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {t('tutorials.title', 'Kako koristiti aplikaciju')}
              </h1>
              <p className="text-gray-400 mt-1">
                {t('tutorials.subtitle', 'Kompletan vodič kroz sve funkcionalnosti SpinTasker aplikacije')}
              </p>
            </div>
          </div>
        </div>

        {/* Tutorial Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/20 rounded-lg p-3">
                    <div className="text-blue-400">
                      {section.icon}
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {section.description}
                    </p>
                  </div>
                </div>
                {expandedSection === section.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {expandedSection === section.id && (
                <div className="px-6 pb-6 border-t border-gray-700 pt-4">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-indigo-900/20 border border-indigo-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="h-6 w-6 text-indigo-400" />
            {t('tutorials.quickTips', 'Brzi saveti')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-indigo-400" />
                <span className="font-semibold text-white text-sm">{t('tutorials.tip1', 'Pretraga')}</span>
              </div>
              <p className="text-gray-400 text-xs">{t('tutorials.tip1Desc', 'Koristite pretragu u svim sekcijama za brzo pronalaženje podataka')}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span className="font-semibold text-white text-sm">{t('tutorials.tip2', 'Zakazivanje')}</span>
              </div>
              <p className="text-gray-400 text-xs">{t('tutorials.tip2Desc', 'Povlačenjem poslova u kalendaru menjate njihovo zakazivanje')}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-indigo-400" />
                <span className="font-semibold text-white text-sm">{t('tutorials.tip3', 'Klijenti')}</span>
              </div>
              <p className="text-gray-400 text-xs">{t('tutorials.tip3Desc', 'Klijenti se automatski kreiraju prilikom kreiranja posla')}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-indigo-400" />
                <span className="font-semibold text-white text-sm">{t('tutorials.tip4', 'Magacin')}</span>
              </div>
              <p className="text-gray-400 text-xs">{t('tutorials.tip4Desc', 'Povezujte ulaze i izlaze robe sa poslovima za bolje praćenje')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialsView;
