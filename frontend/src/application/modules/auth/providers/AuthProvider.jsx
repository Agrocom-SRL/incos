/**
 * Provider: AuthProvider
 * 
 * Single Responsibility: Proporcionar estado global de autenticación vía Context
 * 
 * Clean Architecture:
 * - Application Layer: Provider que expone estado global usando un hook dedicado
 * - NO contiene lógica, solo expone el estado vía Context
 * 
 * Ventajas:
 * - Separación de responsabilidades: la lógica está en useAuth
 * - Estado global: todos los componentes pueden acceder al estado de autenticación
 * - Persistencia: el estado se mantiene en localStorage
 * 
 * Estrategia:
 * - Usa useAuth para gestionar el estado global
 * - Expone el estado vía AuthContext
 */

import { useAuth } from '@application-auth/hooks';
import { AuthContext } from '@application-auth/context/AuthContext';

export const AuthProvider = ({ children }) => {
  // Hook dedicado para gestionar el estado global de autenticación
  const authData = useAuth();

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
};
