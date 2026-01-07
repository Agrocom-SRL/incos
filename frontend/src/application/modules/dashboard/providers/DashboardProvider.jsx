/**
 * Provider: DashboardProvider
 * 
 * Single Responsibility: Solo maneja el estado compartido del módulo de dashboard
 * Open/Closed: Abierto para extensión, cerrado para modificación
 * 
 * Usa useDashboardData para obtener datos dinámicos del backend
 * y useMemo para optimizar el rendimiento
 */

import { useMemo } from 'react';
import { DashboardContext } from '@application-dashboard/context/DashboardContext';
import { useDashboardData } from '@application-dashboard/hooks/useDashboardData';

export const DashboardProvider = ({ children }) => {
  // Hook para obtener datos del dashboard desde el backend
  const {
    carreras,
    docentesDestacados,
    docentesPrincipales,
    actividades,
    stats,
    loading,
    error,
    refetch,
  } = useDashboardData();

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => ({
    // Datos del dashboard
    carreras,
    docentesDestacados,
    docentesPrincipales,
    actividades,
    stats,
    
    // Estados
    loading,
    error,
    
    // Acciones
    refetch,
  }), [
    carreras,
    docentesDestacados,
    docentesPrincipales,
    actividades,
    stats,
    loading,
    error,
    refetch,
  ]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

