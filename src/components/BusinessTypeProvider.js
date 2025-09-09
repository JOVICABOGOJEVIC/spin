import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBusinessType } from '../redux/features/authSlice';
import { selectUserWithMemo, selectBusinessTypeWithMemo } from '../utils/selectorUtils';

/**
 * Komponenta koja osigurava da je business type dostupan u celoj aplikaciji
 * Može se postaviti u layout komponente koje zahtevaju business type
 */
const BusinessTypeProvider = ({ children, fallbackType = 'Handyman' }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUserWithMemo);
  const businessType = useSelector(selectBusinessTypeWithMemo);

  // Koristimo useMemo da izbegnemo nepotrebno ponovno renderovanje
  const shouldInitialize = useMemo(() => {
    return !businessType || businessType === '';
  }, [businessType]);

  useEffect(() => {
    // Ako već imamo business type u Redux state-u, preskačemo
    if (!shouldInitialize) {
      console.log("Business type already set in Redux:", businessType);
      return;
    }

    // Pokušaj da dobiješ iz sessionstorage
    let foundType = sessionStorage.getItem('businessType');
    
    // Ako nije u session, proveri u user objektu
    if (!foundType && user) {
      if (user.result && user.result.businessType) {
        foundType = user.result.businessType;
      } else if (user.businessType) {
        foundType = user.businessType;
      }
    }
    
    // Ako još uvek nije pronađen, pokušaj iz lokalnog skladišta
    if (!foundType) {
      try {
        const profile = localStorage.getItem('profile');
        if (profile) {
          const parsedProfile = JSON.parse(profile);
          
          if (parsedProfile.result && parsedProfile.result.businessType) {
            foundType = parsedProfile.result.businessType;
          } else if (parsedProfile.businessType) {
            foundType = parsedProfile.businessType;
          }
        }
      } catch (error) {
        console.error("Error reading business type from localStorage:", error);
      }
    }
    
    // Ako je pronađen, sačuvaj ga u Redux i session
    if (foundType) {
      console.log("Setting business type from provider:", foundType);
      dispatch(setBusinessType(foundType));
      sessionStorage.setItem('businessType', foundType);
      
      // Produžavamo trajanje sesije
      localStorage.setItem("lastActive", new Date().toISOString());
    } else if (shouldInitialize) {
      // Ako nije pronađen nigde, koristi fallback - ali samo ako stvarno treba
      console.warn("Business type not found, using fallback:", fallbackType);
      dispatch(setBusinessType(fallbackType));
      sessionStorage.setItem('businessType', fallbackType);
    }
  }, [dispatch, user, businessType, fallbackType, shouldInitialize]);

  return <>{children}</>;
};

export default BusinessTypeProvider; 