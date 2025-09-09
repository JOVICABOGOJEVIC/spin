import { createSelector } from 'reselect';

// Osnovni selektori
export const selectUser = state => state.auth.user;
export const selectBusinessType = state => state.auth.businessType;
export const selectAuthState = state => state.auth;

// Memorizovani selektor za korisnika
export const selectUserWithMemo = createSelector(
  [selectUser],
  (user) => user
);

// Memorizovani selektor za auth state
export const selectAuthWithMemo = createSelector(
  [selectAuthState],
  (authState) => authState
);

// Memorizovani selektor za tip biznisa
export const selectBusinessTypeWithMemo = createSelector(
  [selectBusinessType, selectUser],
  (businessType, user) => businessType || user?.result?.businessType || ''
);

// Memorizovani selektor za dobijanje drugih podataka o korisniku
export const selectCompanyName = createSelector(
  [selectUser],
  (user) => user?.result?.companyName || 'Vaša Kompanija'
);

export const selectOwnerName = createSelector(
  [selectUser],
  (user) => user?.result?.ownerName || 'Korisnik'
); 