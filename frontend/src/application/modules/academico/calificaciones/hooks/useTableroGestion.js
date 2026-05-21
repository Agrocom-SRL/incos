/**
 * Tablero de coordinación — pendiente de endpoint backend (sin fake-api).
 */

import { useCallback, useEffect, useState } from 'react';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

const MENSAJE =
  'El tablero de gestión se conectará al backend en la siguiente fase (Fase 2-bis).';

export const useTableroGestion = () => {
  const [tablero, setTablero] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccionando, setIsAccionando] = useState(false);
  const [error, setError] = useState(MENSAJE);

  useEffect(() => {
    setIsLoading(false);
    setTablero(null);
    setError(MENSAJE);
  }, []);

  const iniciarGestion = useCallback(async () => {
    throw new Error(MENSAJE);
  }, []);

  const validarCierre = useCallback(async () => {
    throw new Error(MENSAJE);
  }, []);

  const cerrarBimestre = useCallback(async () => {
    throw new Error(MENSAJE);
  }, []);

  const breadcrumbItems = createBreadcrumbItems('ACA-CAL-TABLERO', 'ACA-CAL', null);

  return {
    tablero,
    isLoading,
    isAccionando,
    error,
    refetch: () => setError(MENSAJE),
    iniciarGestion,
    validarCierre,
    cerrarBimestre,
    breadcrumbItems,
  };
};
