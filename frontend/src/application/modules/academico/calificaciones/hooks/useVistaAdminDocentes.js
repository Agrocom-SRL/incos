/**
 * Lista de docentes para vista administrativa (impersonación).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { calificacionesFakeApi } from '../fake-api/index.js';

export const useVistaAdminDocentes = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await calificacionesFakeApi.listarDocentesVistaAdmin();
      setData(res);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    calificacionesFakeApi.desactivarImpersonacion().catch(() => {});
    cargar();
  }, [cargar]);

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-CAL', 'ACA-CAL', null),
    [],
  );

  return {
    docentes: data?.docentes ?? [],
    gestionVigente: data?.gestionVigente,
    bimestreVigente: data?.bimestreVigente,
    isLoading,
    error,
    refetch: cargar,
    breadcrumbItems,
  };
};
