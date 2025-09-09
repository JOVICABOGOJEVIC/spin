import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Prvo proveravamo localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Ako nema sačuvane teme, proveravamo sistemsku preferenciju
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default tema je light
    return 'light';
  });

  useEffect(() => {
    // Čuvamo temu u localStorage
    localStorage.setItem('theme', theme);
    
    // Postavljamo data-theme atribut na html elementu
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}; 