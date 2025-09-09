import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  Users as TeamIcon,
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
  Wifi,
  Menu,
  X,
  Phone
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    action: true,
    company: false,
    package: false,
    profile: false
  });
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const businessType = useSelector(selectBusinessTypeWithMemo);
  const companyName = useSelector(selectCompanyName);
  const ownerName = useSelector(selectOwnerName);
  const { user } = useSelector((state) => state.auth);
  
  // Log the user data to check country code
  console.log("AdminLayout user data:", {
    user,
    rawCountryCode: user?.result?.countryCode,
    profile: JSON.parse(localStorage.getItem('profile'))
  });
  
  // Ensure country code is properly formatted
  const countryCode = user?.result?.countryCode?.toLowerCase() || 'ba';
  
  console.log("Using country code for flag:", countryCode);
  
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
        profile: false
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
    <div className="flex h-screen bg-themed">
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
          backgroundColor: 'var(--nav-bg)',
          borderRight: '1px solid var(--nav-border)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-6"
          style={{ borderBottom: '1px solid var(--nav-border)' }}
        >
          <div className="flex items-center gap-2">
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
            className="flex items-center py-2.5 px-4 rounded transition duration-200 font-bold"
            style={{
              backgroundColor: isLinkActive('/dashboard') ? 'var(--nav-active-bg)' : 'transparent',
              color: isLinkActive('/dashboard') ? 'var(--nav-active-text)' : 'var(--nav-text)',
              ':hover': {
                backgroundColor: 'var(--nav-bg-hover)',
                color: 'var(--nav-text-hover)'
              }
            }}
          >
            <Layout className="h-5 w-5 mr-2" />
            Dashboard
            {businessType && (
              <span className="ml-2 text-sm font-normal opacity-75">
                ({businessType})
              </span>
            )}
          </Link>
          
          {/* Action Section */}
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
            <span>Action</span>
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
                Jobs
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
                Status
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
                Workers
              </Link>
              <Link 
                to="/dashboard/live" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/live') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/live') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Wifi className="h-4 w-4 mr-2" />
                Live
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
                Services
              </Link>
              <Link 
                to="/dashboard/teams" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/teams') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/teams') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <TeamIcon className="h-4 w-4 mr-2" />
                Teams
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
                Clients
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
                Archive
              </Link>
            </div>
          )}
          
          {/* Company Section */}
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
            <span>Company</span>
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
                Company Info
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
                Spare Parts
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
                Settings
              </Link>
            </div>
          )}
          
          {/* Package Section */}
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
            <span>Package</span>
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
            </div>
          )}
          
          {/* Profile Section */}
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
            <span>Profile</span>
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
                My Profile
              </Link>
              <Link 
                to="/dashboard/theme" 
                className="flex items-center py-2 px-4 rounded transition duration-200"
                style={{
                  backgroundColor: isLinkActive('/dashboard/theme') ? 'var(--nav-active-bg)' : 'transparent',
                  color: isLinkActive('/dashboard/theme') ? 'var(--nav-active-text)' : 'var(--nav-text)',
                  ':hover': {
                    backgroundColor: 'var(--nav-bg-hover)',
                    color: 'var(--nav-text-hover)'
                  }
                }}
              >
                <Layout className="h-4 w-4 mr-2" />
                Theme
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full text-left py-2 px-4 rounded text-white/70 hover:bg-white/10 hover:text-white transition duration-200"
              >
                <User className="h-4 w-4 mr-2" />
                Logout
              </button>
              <div className="flex items-center py-2 px-4 text-white/70">
                <Phone className="h-4 w-4 mr-2" />
                {user?.result?.phone || user?.phone || 'No phone number'}
              </div>
            </div>
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-themed">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 