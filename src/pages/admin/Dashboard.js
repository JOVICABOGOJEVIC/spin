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
import ThemeView from '../../components/views/profileview/ThemeView';
import StatusView from '../../components/views/actionview/StatusView';
import UserManagementView from '../../components/views/profileview/UserManagementView';
import WorkerDashboard from '../../components/views/WorkerDashboard';
import { selectUserWithMemo } from "../../utils/selectorUtils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const user = useSelector(selectUserWithMemo);

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
  if (!isAuthenticated) {
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
            <Route path="/spare-parts" element={<SparePartsView />} />
            <Route path="/theme" element={<ThemeView title="Theme Settings" />} />
            <Route path="/user-management" element={<UserManagementView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
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
          <Route path="/spare-parts" element={<SparePartsView />} />
          <Route path="/theme" element={<ThemeView title="Theme Settings" />} />
          <Route path="/user-management" element={<UserManagementView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BusinessTypeProvider>
  );
};

export default Dashboard;
