import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import { setLogout } from '../../redux/features/authSlice';
import { getBusinessType } from '../../utils/businessTypeUtils';
import { 
  selectBusinessTypeWithMemo, 
  selectCompanyName, 
  selectOwnerName
} from '../../utils/selectorUtils';
import {
  Briefcase,
  Zap,
  Radio,
  Wrench,
  Archive,
  Package,
  FileText,
  Calculator,
  UserPlus as WorkerIcon,
  DollarSign,
  Database,
  Truck,
  BarChart2,
  Gift,
  Award,
  Star,
  Crown,
  Code,
  BookOpen,
  Settings,
  ShoppingBag,
  Globe,
  HelpCircle,
  Layout,
  User,
  ChevronDown,
  ChevronRight,
  Home,
  Activity,
  Clock,
  Brain,
  Menu,
  X,
  Phone,
  StickyNote,
  Banknote,
  CreditCard,
  Wallet
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    action: true,
    company: false,
    package: false,
    profile: false,
    payments: false
  });
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const businessType = useSelector(selectBusinessTypeWithMemo);
  const companyName = useSelector(selectCompanyName);
  const ownerName = useSelector(selectOwnerName);
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.result?.role === 'superadmin';
  const { jobs } = useSelector((state) => state.job || { jobs: [] });
  
  // Log the user data to check country code
  console.log("AdminLayout user data:", {
    user,
    rawCountryCode: user?.result?.countryCode,
    profile: JSON.parse(localStorage.getItem('profile'))
  });
  
  // Ensure country code is properly formatted
  const countryCode = user?.result?.countryCode?.toLowerCase() || 'ba';
  
  console.log("Using country code for flag:", countryCode);
  
  // Calculate scheduled jobs count (jobs with serviceDate and not Completed/Cancelled)
  const scheduledJobsCount = React.useMemo(() => {
    if (!jobs || !Array.isArray(jobs)) return 0;
    return jobs.filter(job => 
      job.serviceDate && 
      job.status !== 'Completed' && 
      job.status !== 'Cancelled'
    ).length;
  }, [jobs]);

  // Calculate rotation duration: 10 jobs = 10s, 100 jobs = 1s (formula: 100 / numberOfJobs)
  const rotationDuration = React.useMemo(() => {
    if (scheduledJobsCount === 0) return 10; // Default to 10s if no jobs
    const duration = 100 / scheduledJobsCount;
    // Clamp between 0.1s (max speed) and 20s (min speed) for reasonable limits
    return Math.max(0.1, Math.min(20, duration));
  }, [scheduledJobsCount]);
  
  const handleLogout = () => {
    dispatch(setLogout());
    navigate('/auth?role=company&type=login');
  };

  const toggleSection = (section) => {
    setOpenSections(prev => {
      const newState = {
        action: false,
        company: false,
        package: false,
        profile: false,
        payments: false
      };
      // Only toggle the clicked section if it was previously closed
      newState[section] = !prev[section];
      return newState;
    });
  };

  const isLinkActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div 
      className="flex h-screen"
      style={{
        backgroundColor: 'var(--color-background, #f0fdf4)',
        color: 'var(--color-text, #1f2937)'
      }}
    >
      {/* Sidebar za mobilne - prikazuje se kao overlay */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden`} 
        onClick={() => setSidebarOpen(false)}></div>
      
      {/* Sidebar */}
      <div 
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform 
          lg:translate-x-0 lg:relative lg:inset-0 shadow-lg
        `}
        style={{
          backgroundColor: 'var(--nav-bg, #1e293b)',
          borderRight: '1px solid var(--nav-border, rgba(255, 255, 255, 0.1))'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-6"
          style={{ borderBottom: '1px solid var(--nav-border)' }}
        >
          <div className="flex items-center gap-2">
            <span 
              style={{ 
                color: '#166534', 
                fontSize: '1.33em', 
                marginRight: '4px', 
                fontWeight: 'bold',
                animation: `spin-slow ${rotationDuration}s linear infinite`
              }} 
              className="text-xl inline-block"
            >
              @
            </span>
            <span style={{ color: 'var(--nav-text)' }} className="text-xl font-semibold">
              {companyName}
            </span>
            <img 
              src={`https://flagcdn.com/${countryCode}.svg`}
              alt={`${countryCode} flag`}
              className="h-4 w-6"
              onError={(e) => {
                console.error("Flag loading error:", {
                  src: e.target.src,
                  countryCode,
                  user: user?.result
                });
                e.target.src = `https://flagcdn.com/ba.svg`; // Fallback to Bosnia flag
              }}
            />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <svg style={{ color: 'var(--nav-text)' }} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-4 px-4 overflow-y-auto pb-20">
          {/* Dashboard Link */}
          <Link 
            to="/dashboard" 
            className="flex flex-col py-2.5 px-4 rounded transition duration-200 font-bold"
            style={{
              backgroundColor: isLinkActive('/dashboard') ? 'var(--nav-active-bg)' : 'transparent',
              color: isLinkActive('/dashboard') ? 'var(--nav-active-text)' : 'var(--nav-text)',
              ':hover': {
                backgroundColor: 'var(--nav-bg-hover)',
                color: 'var(--nav-text-hover)'
              }
            }}
          >
            <div className="flex items-center">
              <Layout className="h-5 w-5 mr-2" />
              {t('nav.dashboard')}
            </div>
            {businessType && (
              <span className="text-xs font-normal opacity-75 mt-1 ml-7">
                {businessType}
              </span>
            )}
          </Link>
          
          {/* Action Section - Hidden for super admin */}
          {!isSuperAdmin && (
            <>
              <button 
                onClick={() => toggleSection('action')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider mt-6 rounded"
                style={{
                  color: 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)'
                  }
                }}
              >
                <span>{t('nav.action')}</span>
                {openSections.action ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {openSections.action && (
                <div className="mt-2 space-y-1 pl-2">
              <Link 
                to="/dashboard/jobs" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/jobs') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/jobs') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('nav.jobs')}
              </Link>
              <Link 
                to="/dashboard/status" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/status') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/status') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Activity className="h-4 w-4 mr-2" />
                {t('nav.status')}
              </Link>
              <Link 
                to="/dashboard/workers" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/workers') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/workers') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <WorkerIcon className="h-4 w-4 mr-2" />
                {t('nav.workers')}
              </Link>
              <Link 
                to="/dashboard/ai-business" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/ai-business') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/ai-business') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Brain className="h-4 w-4 mr-2" />
                {t('nav.aiBusiness')}
              </Link>
              <Link 
                to="/dashboard/services" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/services') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/services') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Wrench className="h-4 w-4 mr-2" />
                {t('nav.services')}
              </Link>
              <Link 
                to="/dashboard/clients" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/clients') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/clients') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <User className="h-4 w-4 mr-2" />
                {t('nav.clients')}
              </Link>
              <Link 
                to="/dashboard/notifications" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/notifications') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/notifications') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <StickyNote className="h-4 w-4 mr-2" />
                {t('nav.notifications')}
              </Link>
              <Link 
                to="/dashboard/archive" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/archive') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/archive') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Archive className="h-4 w-4 mr-2" />
                {t('nav.archive')}
              </Link>
            </div>
              )}
            </>
          )}
          
          {/* Company Section - Hidden for super admin */}
          {!isSuperAdmin && (
            <>
              <button 
            onClick={() => toggleSection('company')}
            className="flex items-center justify-between w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider mt-6 rounded"
            style={{
              color: 'var(--nav-text)',
              ':hover': {
                backgroundColor: 'var(--nav-bg-hover)'
              }
            }}
          >
            <span>{t('nav.company')}</span>
            {openSections.company ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          {openSections.company && (
            <div className="mt-2 space-y-1 pl-2">
              <Link 
                to="/dashboard/company/info" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/company/info') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/company/info') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                {t('company.info')}
              </Link>
              <Link 
                to="/dashboard/spare-parts" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/spare-parts') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/spare-parts') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                {t('nav.spareParts')}
              </Link>
              <Link 
                to="/dashboard/company/inventory" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/company/inventory') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/company/inventory') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                {t('nav.inventory', 'Magacin')}
              </Link>
              <Link 
                to="/dashboard/company/inventory/inputs" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/company/inventory/inputs') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/company/inventory/inputs') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                {t('nav.inventoryInputs', 'Ulazi robe')}
              </Link>
              <Link 
                to="/dashboard/company/inventory/outputs" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/company/inventory/outputs') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/company/inventory/outputs') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                {t('nav.inventoryOutputs', 'Izlazi robe')}
              </Link>
              <Link 
                to="/dashboard/company/inventory/withdrawn" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/company/inventory/withdrawn') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/company/inventory/withdrawn') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                {t('nav.withdrawnItems', 'Povučena roba')}
              </Link>
              <Link 
                to="/dashboard/company/inventory/customs" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/company/inventory/customs') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/company/inventory/customs') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('nav.customs', 'Carina')}
              </Link>
              <Link 
                to="/dashboard/company/inventory/calculations" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/company/inventory/calculations') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/company/inventory/calculations') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {t('nav.calculations', 'Kalkulacije')}
              </Link>
              <Link 
                to="/dashboard/company/settings" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/company/settings') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/company/settings') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('nav.settings')}
              </Link>
            </div>
          )}
            </>
          )}
          
          {/* Package Section - Hidden for super admin */}
          {!isSuperAdmin && (
            <>
              <button 
            onClick={() => toggleSection('package')}
            className="flex items-center justify-between w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider mt-6 rounded"
            style={{
              color: 'var(--nav-text)',
              ':hover': {
                backgroundColor: 'var(--nav-bg-hover)'
              }
            }}
          >
            <span>{t('nav.package')}</span>
            {openSections.package ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          {openSections.package && (
            <div className="mt-2 space-y-1 pl-2">
              <Link 
                to="/dashboard/packages/free" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/packages/free') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/packages/free') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Gift className="h-4 w-4 mr-2" />
                Free
              </Link>
              <Link 
                to="/dashboard/packages/standard" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/packages/standard') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/packages/standard') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Award className="h-4 w-4 mr-2" />
                Standard
              </Link>
              <Link 
                to="/dashboard/packages/business" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/packages/business') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/packages/business') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Star className="h-4 w-4 mr-2" />
                Business
              </Link>
              <Link 
                to="/dashboard/packages/premium" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/packages/premium') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/packages/premium') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                Premium
              </Link>
              <Link 
                to="/dashboard/packages/tutorials" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/packages/tutorials') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/packages/tutorials') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2 text-green-500" />
                {t('packages.tutorials', 'Kako koristiti')}
              </Link>
            </div>
          )}
            </>
          )}
          
          {/* Notifications - Visible for all users including super admin */}
          {isSuperAdmin && (
            <Link 
              to="/dashboard/notifications" 
              className="flex items-center py-2 px-4 rounded transition duration-200 mt-4"
              style={{
                backgroundColor: isLinkActive('/dashboard/notifications') ? 'var(--nav-active-bg)' : 'transparent',
                color: isLinkActive('/dashboard/notifications') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                ':hover': {
                  backgroundColor: 'var(--nav-bg-hover)',
                  color: 'var(--nav-text-hover)'
                }
              }}
            >
              <StickyNote className="h-4 w-4 mr-2" />
              Notifications
            </Link>
          )}
          
          {/* Profile Section - Hidden for super admin */}
          {!isSuperAdmin && (
            <>
              <button 
            onClick={() => toggleSection('profile')}
            className="flex items-center justify-between w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider mt-6 rounded"
            style={{
              color: 'var(--nav-text)',
              ':hover': {
                backgroundColor: 'var(--nav-bg-hover)'
              }
            }}
          >
            <span>{t('nav.profile')}</span>
            {openSections.profile ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          {openSections.profile && (
            <div className="mt-2 space-y-1 pl-2">
              <Link 
                to="/dashboard/profile" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/profile') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/profile') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <User className="h-4 w-4 mr-2" />
                {t('nav.myProfile')}
              </Link>
              <Link 
                to="/dashboard/user-management" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/user-management') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/user-management') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <User className="h-4 w-4 mr-2" />
                {t('nav.userManagement')}
              </Link>
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full text-left py-2 px-4 rounded text-white/70 hover:bg-white/10 hover:text-white transition duration-200"
              >
                <User className="h-4 w-4 mr-2" />
                {t('auth.logout')}
              </button>
              <div className="flex items-center py-2 px-4 text-white/70">
                <Phone className="h-4 w-4 mr-2" />
                {user?.result?.phone || user?.phone || 'No phone number'}
              </div>
            </div>
          )}
          
          {/* Payments Section - Hidden for super admin */}
          {!isSuperAdmin && (
            <>
              <button 
                onClick={() => toggleSection('payments')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider mt-6 rounded"
                style={{
                  color: 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)'
                  }
                }}
              >
                <span>{t('nav.payments')}</span>
                {openSections.payments ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {openSections.payments && (
                <div className="mt-2 space-y-1 pl-2">
                  <Link 
                    to="/dashboard/payments/wire-transfer" 
                    className="flex items-center py-2 px-4 rounded transition duration-200"
                    style={{
                      backgroundColor: isLinkActive('/dashboard/payments/wire-transfer') ? 'var(--nav-active-bg)' : 'transparent',
                      color: isLinkActive('/dashboard/payments/wire-transfer') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                      ':hover': {
                        backgroundColor: 'var(--nav-bg-hover)',
                        color: 'var(--nav-text-hover)'
                      }
                    }}
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    {t('nav.wireTransfer')}
                  </Link>
                  <Link 
                    to="/dashboard/payments/card" 
                    className="flex items-center py-2 px-4 rounded transition duration-200"
                    style={{
                      backgroundColor: isLinkActive('/dashboard/payments/card') ? 'var(--nav-active-bg)' : 'transparent',
                      color: isLinkActive('/dashboard/payments/card') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                      ':hover': {
                        backgroundColor: 'var(--nav-bg-hover)',
                        color: 'var(--nav-text-hover)'
                      }
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('nav.cardPayment')}
                  </Link>
                  <Link 
                    to="/dashboard/payments/paypal" 
                    className="flex items-center py-2 px-4 rounded transition duration-200"
                    style={{
                      backgroundColor: isLinkActive('/dashboard/payments/paypal') ? 'var(--nav-active-bg)' : 'transparent',
                      color: isLinkActive('/dashboard/payments/paypal') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                      ':hover': {
                        backgroundColor: 'var(--nav-bg-hover)',
                        color: 'var(--nav-text-hover)'
                      }
                    }}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {t('nav.paypal')}
                  </Link>
                </div>
              )}
            </>
          )}
            </>
          )}
          
          {/* Super Admin Section - Only visible to super admin */}
          {isSuperAdmin && (
            <>
              <div className="border-t border-gray-700 my-4"></div>
              <Link 
                to="/dashboard/superadmin" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/superadmin') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/superadmin') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Crown className="h-4 w-4 mr-2" />
                {t('nav.superAdmin')}
              </Link>
            </>
          )}
        </nav>
      </div>
      
      {/* Header i glavni sadržaj */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header 
          className="lg:hidden flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: 'var(--nav-bg)',
            borderColor: 'var(--nav-border)',
            color: 'var(--nav-text)'
          }}
        >
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="focus:outline-none">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
          </div>
        </header>
        
        {/* Main content */}
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto"
          style={{
            backgroundColor: 'var(--color-background, #f0fdf4)',
            backgroundImage: 'var(--list-bg-image, none)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'var(--color-text, #1f2937)',
            minHeight: '100vh'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 