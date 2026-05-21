/**
 * Gestión de bimestres (coordinación) — API real.
 */

import { useCallback, useEffect, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

const mapError = (err, fallback) => {
  const e = new Error(err?.response?.data?.error || err?.message || fallback);
  e.code = err?.response?.data?.code || err?.code;
  if (err?.response?.data?.data?.validacion) {
    e.validacion = err.response.data.data.validacion;
  }
  return e;
};

export const useGestionBimestres = () => {
  const [tablero, setTablero] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccionando, setIsAccionando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await CalificacionRepository.obtenerGestionBimestres();
      if (!res.success) {
        setTablero(null);
        setError(res.error || 'No se pudo cargar la gestión de bimestres');
        return;
      }
      setTablero(res.data ?? null);
    } catch (err) {
      setTablero(null);
      setError(err?.message || 'No se pudo cargar la gestión de bimestres');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const iniciarGestion = useCallback(async () => {
    setIsAccionando(true);
    try {
      const res = await CalificacionRepository.iniciarGestionAcademica();
      if (!res.success) {
        throw mapError({ message: res.error, code: res.code }, 'No se pudo iniciar la gestión');
      }
      await cargar();
      return res.data;
    } catch (err) {
      throw mapError(err, 'No se pudo iniciar la gestión');
    } finally {
      setIsAccionando(false);
    }
  }, [cargar]);

  const validarCierre = useCallback(async (numero) => {
    const res = await CalificacionRepository.validarCierreBimestre(numero);
    if (!res.success) throw mapError({ message: res.error }, 'No se pudo validar el cierre');
    return res.data;
  }, []);

  const cerrarBimestre = useCallback(
    async (numero) => {
      setIsAccionando(true);
      try {
        const res = await CalificacionRepository.cerrarBimestreGestion(numero);
        if (!res.success) {
          throw mapError(
            { message: res.error, code: res.code, validacion: res.validacion },
            'No se pudo cerrar',
          );
        }
        await cargar();
        return res.data;
      } catch (err) {
        throw mapError(err, 'No se pudo cerrar el bimestre');
      } finally {
        setIsAccionando(false);
      }
    },
    [cargar],
  );

  const breadcrumbItems = createBreadcrumbItems('ACA-CAL-GESTION-BIMESTRES', 'ACA-CAL', null);

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
