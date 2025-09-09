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
import WorkersView from '../../components/views/actionview/WorkersView';
import SparePartsView from '../../components/dashboard/SparePartsView';
import ThemeView from '../../components/views/profileview/ThemeView';
import { selectUserWithMemo } from "../../utils/selectorUtils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const user = useSelector(selectUserWithMemo);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const profile = localStorage.getItem("profile");
      if (!profile) {
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
              setIsAuthenticated(false);
              // Clear storage
              localStorage.removeItem('profile');
              localStorage.removeItem('token');
              localStorage.removeItem('lastActive');
              sessionStorage.clear();
            } else {
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
    if (!loading && !isAuthenticated) {
      navigate("/auth?role=company&type=login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Ako nije autentifikovan, ne renderujemo ništa dok nas efekat ne preusmeri
  if (!isAuthenticated) {
    return <LoadingSpinner />;
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
            <Route path="/clients" element={<ClientsView />} />
            <Route path="/workers" element={<WorkersView />} />
            <Route path="/spare-parts" element={<SparePartsView />} />
            <Route path="/theme" element={<ThemeView title="Theme Settings" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BusinessTypeProvider>
    );
  }

  // Standardni prikaz za autentifikovane korisnike
  return (
    <BusinessTypeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/jobs/*" element={<JobsDashboard />} />
          <Route path="/clients/*" element={<ClientsView />} />
          <Route path="/workers/*" element={<WorkersView />} />
          <Route path="/spare-parts" element={<SparePartsView />} />
          <Route path="/theme" element={<ThemeView title="Theme Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BusinessTypeProvider>
  );
};

export default Dashboard;
