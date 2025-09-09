import './App.css';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import Home from './pages/Home';
import AuthPage from './pages/auth/AuthPage';
import Dashboard from './pages/admin/Dashboard';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setBusinessType, setUser } from './redux/features/authSlice';

function App() {
  const dispatch = useDispatch();
  const [initialized, setInitialized] = useState(false);

  // Inicijalizujemo business type i sesiju pri pokretanju aplikacije
  useEffect(() => {
    const initializeApp = () => {
      // Prvo, proverimo sesiju/autentifikaciju
      const profile = localStorage.getItem('profile');
      if (profile) {
        try {
          const parsedProfile = JSON.parse(profile);
          
          // Postavimo korisnika u Redux state
          dispatch(setUser(parsedProfile));
          
          // Zatim, proverimo business type
          let businessType = sessionStorage.getItem('businessType');
          
          // Ako nije pronađen u session storage, uzmimo iz profila
          if (!businessType) {
            if (parsedProfile.result && parsedProfile.result.businessType) {
              businessType = parsedProfile.result.businessType;
            } else if (parsedProfile.businessType) {
              businessType = parsedProfile.businessType;
            }
          }
          
          if (businessType) {
            console.log("Initializing business type:", businessType);
            dispatch(setBusinessType(businessType));
            sessionStorage.setItem('businessType', businessType);
          }
        } catch (e) {
          console.error("Error initializing app state:", e);
        }
      }
      
      // Označimo da je inicijalizacija završena
      setInitialized(true);
    };
    
    initializeApp();
  }, [dispatch]);
  
  // Implementiramo periodičnu proveru sesije
  useEffect(() => {
    const sessionCheckInterval = setInterval(() => {
      const lastActive = localStorage.getItem('lastActive');
      if (lastActive) {
        const lastActiveTime = new Date(lastActive);
        const currentTime = new Date();
        
        // Ako je proteklo više od 24 sata, isključi sesiju
        const hoursPassed = (currentTime - lastActiveTime) / (1000 * 60 * 60);
        if (hoursPassed > 24) {
          // Sesija je istekla, možemo da prikažemo poruku i/ili izvedemo logout
          console.log("Session expired after 24 hours of inactivity");
          localStorage.removeItem('lastActive');
        }
      }
    }, 60000); // Provera svakog minuta
    
    return () => clearInterval(sessionCheckInterval);
  }, []);

  // Ako nije inicijalizovano, prikažimo prazan div
  if (!initialized) {
    return <div className="app-loading"></div>;
  }

  return (
    <div className="font-['Inter',_sans-serif]">
      <BrowserRouter>
        <ToastContainer autoClose={2000} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/auth/*' element={<AuthPage />} />
          <Route path='/dashboard/*' element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
