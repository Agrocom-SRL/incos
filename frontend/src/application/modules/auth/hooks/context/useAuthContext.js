/**
 * Hook: useAuthContext
 * 
 * Single Responsibility: Consumir el contexto de autenticación
 * 
 * Clean Architecture:
 * - Application Layer: Accede al contexto de autenticación
 */

import { useContext } from 'react';
import { AuthContext } from '@application-auth/context/AuthContext';

/**
 * Hook para consumir el contexto de autenticación
 * 
 * @returns {Object} Contexto de autenticación con:
 * - isAuthenticated: boolean
 * - user: Object | null
 * - loading: boolean
 * - login: (username, password) => Promise
 * - logout: () => void
 * @throws {Error} Si se usa fuera del AuthProvider
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
