/**
 * Tablero de coordinación — carga, iniciar gestión y cerrar bimestre.
 */

import { useCallback, useEffect, useState } from 'react';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { calificacionesFakeApi } from '../fake-api/index.js';

export const useTableroGestion = () => {
  const [tablero, setTablero] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccionando, setIsAccionando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await calificacionesFakeApi.obtenerTablero();
      setTablero(data);
    } catch (err) {
      setError(err);
      setTablero(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const iniciarGestion = useCallback(async () => {
    setIsAccionando(true);
    setError(null);
    try {
      const res = await calificacionesFakeApi.iniciarBimestre1();
      setTablero(res.tablero);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsAccionando(false);
    }
  }, []);

  const validarCierre = useCallback(async (numero) => {
    return calificacionesFakeApi.validarCierreBimestre({ numero });
  }, []);

  const cerrarBimestre = useCallback(
    async (numero) => {
      setIsAccionando(true);
      setError(null);
      try {
        const res = await calificacionesFakeApi.cerrarBimestre({ numero });
        setTablero(res.tablero);
        return res;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsAccionando(false);
      }
    },
    [],
  );

  const breadcrumbItems = createBreadcrumbItems('ACA-CAL-TABLERO', 'ACA-CAL', null);

  return {
    tablero,
    isLoading,
    isAccionando,
    error,
    refetch: cargar,
    iniciarGestion,
    validarCierre,
    cerrarBimestre,
    breadcrumbItems,
  };
};
