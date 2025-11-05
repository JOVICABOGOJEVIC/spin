import { useState, useEffect } from 'react';
import { getBusinessType } from '../utils/businessTypeUtils';

// Mapiranje business type-a na teme
const businessTypeToTheme = {
  'Home Appliance Technician': 'appliance-repair',
  'Electrician': 'electrical-service',
  'Plumber': 'hvac-service', // Može biti water-related
  'Auto Mechanic': 'auto-service',
  'Elevator Technician': 'construction',
  'HVAC Technician': 'hvac-service',
  'Carpenter': 'construction',
  'Locksmith': 'construction',
  'Tile Installer': 'construction',
  'Painter': 'painting-service',
  'Facade Specialist': 'painting-service',
  'IT Technician': 'it-service',
  'Handyman': 'appliance-repair' // Default za Handyman
};

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Prvo proveravamo localStorage (korisnik je možda ručno postavio)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Ako nema sačuvane teme, određujemo na osnovu business type-a
    const businessType = getBusinessType();
    if (businessType && businessTypeToTheme[businessType]) {
      return businessTypeToTheme[businessType];
    }
    
    // Ako nema business type-a, proveravamo sistemsku preferenciju
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default tema je appliance-repair (za servisere kućnih aparata)
    return 'appliance-repair';
  });

  useEffect(() => {
    // Čuvamo temu u localStorage
    localStorage.setItem('theme', theme);
    
    // Postavljamo data-theme atribut na html elementu
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Automatski ažuriranje teme kada se business type promeni
  useEffect(() => {
    const businessType = getBusinessType();
    if (businessType && businessTypeToTheme[businessType]) {
      const autoTheme = businessTypeToTheme[businessType];
      // Ako korisnik nije ručno postavio temu, postavljamo automatski
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme || savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(autoTheme);
      }
    }
  }, []);

  return { theme, setTheme };
}; 