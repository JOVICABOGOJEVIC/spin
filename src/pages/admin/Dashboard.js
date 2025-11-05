import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Layout from '../../components/layout/AdminLayout';
import BusinessTypeProvider from '../../components/BusinessTypeProvider';
import DashboardHome from './DashboardHome';
import JobsDashboard from '../../components/dashboard/JobsDashboard';
import ClientsView from '../../components/views/ClientsView';
import ArchiveView from '../../components/views/ArchiveView';
import WorkersView from '../../components/views/actionview/WorkersView';
import SparePartsView from '../../components/dashboard/SparePartsView';
import CompanyInfoView from '../../components/views/companyview/CompanyInfoView';
import InventoryView from '../../components/views/companyview/InventoryView';
import InventoryInputsView from '../../components/views/companyview/InventoryInputsView';
import InventoryOutputsView from '../../components/views/companyview/InventoryOutputsView';
import WithdrawnItemsView from '../../components/views/companyview/WithdrawnItemsView';
import CustomsView from '../../components/views/companyview/CustomsView';
import CalculationsView from '../../components/views/companyview/CalculationsView';
import NotificationsView from '../../components/views/NotesView';
import FreeView from '../../components/views/packageview/FreeView';
import StandardView from '../../components/views/packageview/StandardView';
import BusinessView from '../../components/views/packageview/BusinessView';
import PremiumView from '../../components/views/packageview/PremiumView';
import TutorialsView from '../../components/views/packageview/TutorialsView';
import SuperAdminDashboard from '../../components/views/superadmin/SuperAdminDashboard';
import StatusView from '../../components/views/actionview/StatusView';
import UserManagementView from '../../components/views/profileview/UserManagementView';
import WorkerDashboard from '../../components/views/WorkerDashboard';
import WireTransferView from '../../components/views/paymentsview/WireTransferView';
import CardPaymentView from '../../components/views/paymentsview/CardPaymentView';
import PayPalView from '../../components/views/paymentsview/PayPalView';
import { selectUserWithMemo } from "../../utils/selectorUtils";

// Component to handle redirect when non-superadmin tries to access superadmin route
const SuperAdminRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const profile = localStorage.getItem('profile');
    
    if (!profile) {
      // User is not logged in, redirect to login
      toast.error('Morate biti prijavljeni kao super admin da biste pristupili ovoj sekciji.');
      setTimeout(() => {
        navigate('/auth?role=company&type=login', { replace: true });
      }, 1500);
    } else {
      // User is logged in but not super admin, redirect to dashboard home
      toast.error('Nemate pristup Super Admin sekciji. Samo super admin korisnici mogu pristupiti ovoj stranici.');
      setTimeout(() => {
        navigate('/dashboard/', { replace: true });
      }, 1500);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Preusmeravanje...</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const user = useSelector(selectUserWithMemo);

  // Check for super admin role and redirect if needed
  useEffect(() => {
    // Check from Redux state
    const isSuperAdminRedux = user?.result?.role === 'superadmin';
    
    // Check from localStorage as fallback
    const profileStr = localStorage.getItem('profile');
    let isSuperAdminStorage = false;
    if (profileStr) {
      try {
        const profileData = JSON.parse(profileStr);
        isSuperAdminStorage = profileData?.result?.role === 'superadmin';
      } catch (e) {
        console.error('Error parsing profile for super admin check:', e);
      }
    }
    
    const isSuperAdmin = isSuperAdminRedux || isSuperAdminStorage;
    
    // If super admin and not already on superadmin route, redirect
    if (isSuperAdmin && !loading && isAuthenticated) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/dashboard/superadmin') && currentPath.includes('/dashboard')) {
        console.log('🔄 Super admin detected, redirecting to /dashboard/superadmin');
        navigate('/dashboard/superadmin', { replace: true });
      }
    }
  }, [user, loading, isAuthenticated, navigate]);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      console.log('🔍 Dashboard: Checking authentication...');
      const profile = localStorage.getItem("profile");
      console.log('🔍 Profile exists:', !!profile);
      if (!profile) {
        console.log('❌ No profile found, redirecting to login');
        setIsAuthenticated(false);
      } else {
        try {
          const profileData = JSON.parse(profile);
          if (profileData.token) {
            // Check token expiration
            const token = profileData.token;
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const { exp } = JSON.parse(jsonPayload);
            const expired = Date.now() >= exp * 1000;
            
            if (expired) {
              console.log('❌ Token expired, redirecting to login');
              setIsAuthenticated(false);
              // Clear storage
              localStorage.removeItem('profile');
              localStorage.removeItem('token');
              localStorage.removeItem('lastActive');
              sessionStorage.clear();
            } else {
              console.log('✅ Token valid, user authenticated');
              setIsAuthenticated(true);
            }
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error parsing profile:", error);
          setIsAuthenticated(false);
        }
      }
      
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };

    checkAuth();

    // Set up periodic check every minute
    const intervalId = setInterval(checkAuth, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Ovaj efekat će se pokrenuti kada se promeni `isAuthenticated`
  // i koristimo ga za usmeravanja umesto direktno u render
  useEffect(() => {
    console.log('🔍 Dashboard: Authentication effect triggered');
    console.log('  Loading:', loading);
    console.log('  IsAuthenticated:', isAuthenticated);
    console.log('  Current URL:', window.location.pathname);
    
    if (!loading && !isAuthenticated) {
      console.log('❌ Redirecting to login...');
      // Add a small delay to prevent race conditions with API interceptor
      setTimeout(() => {
        navigate("/auth?role=company&type=login");
      }, 100);
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Ako nije autentifikovan, ne renderujemo ništa dok nas efekat ne preusmeri
  // But also check if trying to access superadmin route without auth
  if (!isAuthenticated) {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/dashboard/superadmin')) {
      // Trying to access superadmin without auth - redirect immediately
      setTimeout(() => {
        navigate('/auth?role=company&type=login', { replace: true });
      }, 0);
    }
    return <LoadingSpinner />;
  }

  // SECURITY: Strict authentication check - userType is the primary source of truth
  const userTypeFromStorage = localStorage.getItem('userType');
  const profileStr = localStorage.getItem('profile');
  let profileData = null;
  try {
    profileData = profileStr ? JSON.parse(profileStr) : null;
  } catch (e) {
    console.error('Error parsing profile:', e);
  }
  
  // Additional validation: check profile structure to ensure userType matches actual data
  const hasWorkerStructure = profileData?.result?.firstName && profileData?.result?.lastName;
  const hasCompanyStructure = profileData?.result?.companyName;
  
  // Determine user type with strict validation
  let isWorker = false;
  let isCompany = false;
  
  if (userTypeFromStorage === 'worker') {
    // If userType is worker, validate it has worker structure and NOT company structure
    if (hasWorkerStructure && !hasCompanyStructure) {
      isWorker = true;
    } else {
      console.error('🚨 SECURITY WARNING: userType is worker but profile structure does not match!');
      // If mismatch, default to company for security
      isCompany = true;
    }
  } else if (userTypeFromStorage === 'company' || !userTypeFromStorage) {
    // If userType is company or not set, validate it has company structure
    if (hasCompanyStructure) {
      isCompany = true;
    } else if (hasWorkerStructure && !hasCompanyStructure) {
      // Edge case: worker structure but no userType - this shouldn't happen but handle it
      console.warn('⚠️ Warning: Profile has worker structure but userType is not set');
      isWorker = true;
    } else {
      // Default to company for security
      isCompany = true;
    }
  }
  
  const workerPermissions = JSON.parse(localStorage.getItem('workerPermissions') || '{}');
  const canViewAllJobs = workerPermissions.canViewAllJobs;

  // Worker Dashboard - ONLY show if user is confirmed worker AND doesn't have admin permissions
  if (isWorker && !canViewAllJobs) {
    console.log('✅ Routing to Worker Dashboard');
    return (
      <BusinessTypeProvider>
        <WorkerDashboard />
      </BusinessTypeProvider>
    );
  }
  
  // If worker has canViewAllJobs permission, they see admin dashboard (this is intentional)
  if (isWorker && canViewAllJobs) {
    console.log('✅ Worker with admin permissions - routing to Admin Dashboard');
  }
  
  // Company/Admin Dashboard - default for all non-workers
  if (isCompany || !isWorker) {
    console.log('✅ Routing to Admin/Company Dashboard');
  }

  // Ako nema korisnika u Redux stanju ali imamo localstorage profil, 
  // to može biti stanje nakon refresha - svejedno prikazujemo dashboard
  if (!user && !loading && isAuthenticated) {
    // Check profile from localStorage for role
    const profileStr = localStorage.getItem('profile');
    let profileData = null;
    try {
      profileData = profileStr ? JSON.parse(profileStr) : null;
    } catch (e) {
      console.error('Error parsing profile:', e);
    }
    const isSuperAdminFromStorage = profileData?.result?.role === 'superadmin';

    return (
      <BusinessTypeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/jobs" element={<JobsDashboard />} />
            <Route path="/status" element={<StatusView />} />
            <Route path="/clients" element={<ClientsView />} />
            <Route path="/archive" element={<ArchiveView />} />
            <Route path="/workers" element={<WorkersView />} />
            <Route path="/notifications" element={<NotificationsView />} />
            <Route path="/company/info" element={<CompanyInfoView />} />
            <Route path="/company/inventory" element={<InventoryView />} />
            <Route path="/company/inventory/inputs" element={<InventoryInputsView />} />
            <Route path="/company/inventory/outputs" element={<InventoryOutputsView />} />
            <Route path="/company/inventory/withdrawn" element={<WithdrawnItemsView />} />
            <Route path="/company/inventory/customs" element={<CustomsView />} />
            <Route path="/company/inventory/calculations" element={<CalculationsView />} />
            <Route path="/packages/free" element={<FreeView />} />
            <Route path="/packages/standard" element={<StandardView />} />
            <Route path="/packages/business" element={<BusinessView />} />
            <Route path="/packages/premium" element={<PremiumView />} />
            <Route path="/packages/tutorials" element={<TutorialsView />} />
            <Route path="/spare-parts" element={<SparePartsView />} />
            <Route path="/user-management" element={<UserManagementView />} />
            <Route path="/payments/wire-transfer" element={<WireTransferView />} />
            <Route path="/payments/card" element={<CardPaymentView />} />
            <Route path="/payments/paypal" element={<PayPalView />} />
            {isSuperAdminFromStorage ? (
              <Route path="/superadmin" element={<SuperAdminDashboard />} />
            ) : (
              <Route path="/superadmin" element={<SuperAdminRedirect />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BusinessTypeProvider>
    );
  }

  // Check if user is super admin
  const isSuperAdmin = user?.result?.role === 'superadmin';
  
  // Super admin only sees super admin dashboard
  if (isSuperAdmin) {
    return (
      <BusinessTypeProvider>
        <Layout>
          <Routes>
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
            <Route path="/notifications" element={<NotificationsView />} />
            <Route path="*" element={<Navigate to="/superadmin" replace />} />
          </Routes>
        </Layout>
      </BusinessTypeProvider>
    );
  }

  // Standardni prikaz za autentifikovane korisnike (company users i workers sa canViewAllJobs)
  return (
    <BusinessTypeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/jobs/*" element={<JobsDashboard />} />
          <Route path="/status" element={<StatusView />} />
          <Route path="/clients/*" element={<ClientsView />} />
          <Route path="/archive" element={<ArchiveView />} />
          <Route path="/workers/*" element={<WorkersView />} />
          <Route path="/notifications" element={<NotificationsView />} />
          <Route path="/company/info" element={<CompanyInfoView />} />
          <Route path="/company/inventory" element={<InventoryView />} />
          <Route path="/company/inventory/inputs" element={<InventoryInputsView />} />
          <Route path="/company/inventory/outputs" element={<InventoryOutputsView />} />
          <Route path="/company/inventory/withdrawn" element={<WithdrawnItemsView />} />
          <Route path="/company/inventory/customs" element={<CustomsView />} />
          <Route path="/company/inventory/calculations" element={<CalculationsView />} />
          <Route path="/packages/free" element={<FreeView />} />
          <Route path="/packages/standard" element={<StandardView />} />
          <Route path="/packages/business" element={<BusinessView />} />
          <Route path="/packages/premium" element={<PremiumView />} />
          <Route path="/packages/tutorials" element={<TutorialsView />} />
          <Route path="/spare-parts" element={<SparePartsView />} />
          <Route path="/user-management" element={<UserManagementView />} />
          <Route path="/payments/wire-transfer" element={<WireTransferView />} />
          <Route path="/payments/card" element={<CardPaymentView />} />
          <Route path="/payments/paypal" element={<PayPalView />} />
          <Route path="/superadmin" element={<SuperAdminRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BusinessTypeProvider>
  );
};

export default Dashboard;
