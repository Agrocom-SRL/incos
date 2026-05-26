/**
 * Provider: DashboardProvider
 *
 * Estado compartido del módulo dashboard (carreras, últimos docentes/estudiantes, actividades, conteos).
 */

import { useMemo } from 'react';
import { DashboardContext } from '@application-dashboard/context/DashboardContext';
import { useDashboardData } from '@application-dashboard/hooks/useDashboardData';

export const DashboardProvider = ({ children }) => {
  const {
    puedeVerDetalleCarreras,
    puedeVerDetalleDocentes,
    puedeVerDetalleEstudiantes,
    carreras,
    ultimosDocentes,
    ultimosEstudiantes,
    actividades,
    stats,
    loading,
    error,
    refetch,
  } = useDashboardData();

  const value = useMemo(
    () => ({
      puedeVerDetalleCarreras,
      puedeVerDetalleDocentes,
      puedeVerDetalleEstudiantes,
      carreras,
      ultimosDocentes,
      ultimosEstudiantes,
      actividades,
      stats,
      loading,
      error,
      refetch,
    }),
    [
      puedeVerDetalleCarreras,
      puedeVerDetalleDocentes,
      puedeVerDetalleEstudiantes,
      carreras,
      ultimosDocentes,
      ultimosEstudiantes,
      actividades,
      stats,
      loading,
      error,
      refetch,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};
