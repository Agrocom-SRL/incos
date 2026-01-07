/**
 * Hook: useDashboardContext
 * 
 * Single Responsibility: Consumir el contexto del dashboard
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { useContext } from 'react';
import { DashboardContext } from '@application-dashboard/context/DashboardContext';

/**
 * Hook para consumir el contexto del dashboard
 * @returns {Object} Contexto del dashboard
 * @throws {Error} Si se usa fuera del DashboardProvider
 */
export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within DashboardProvider');
  }
  return context;
};

