/**
 * Lista de docentes para coordinación de Asistencia (elegir docente).
 * Gemelo de useVistaAdminDocentes (Calificaciones).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCasesFactory } from '@container';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

const BUSQUEDA_DEBOUNCE_MS = 400;
const BUSQUEDA_MIN_CHARS = 2;
const PRELIM_LIMIT = 15;

export const useVistaAdminAsistenciaDocentes = () => {
  const [gestionVigente, setGestionVigente] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busquedaInput, setBusquedaInput] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busquedaInput.trim()), BUSQUEDA_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.listarCoordinacionAsistenciaDocentes();
      const esBusqueda = busquedaDebounced.length >= BUSQUEDA_MIN_CHARS;
      const result = esBusqueda
        ? await uc.ejecutar({ q: busquedaDebounced, limit: 50 })
        : await uc.ejecutar({ preliminar: true, limit: PRELIM_LIMIT });

      if (!result?.success) {
        setDocentes([]);
        setGestionVigente(null);
        setError(result?.error || 'No se pudo cargar el listado');
        return;
      }

      setGestionVigente(result.data?.gestionVigente ?? null);
      setDocentes(Array.isArray(result.data?.docentes) ? result.data.docentes : []);
    } catch (err) {
      setDocentes([]);
      setGestionVigente(null);
      setError(err?.message || 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  }, [busquedaDebounced]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const breadcrumbItems = useMemo(() => createBreadcrumbItems('ACA-ASI', 'ACA-ASI', null), []);

  const esBusquedaActiva = busquedaDebounced.length >= BUSQUEDA_MIN_CHARS;

  return {
    docentes,
    gestionVigente,
    isLoading,
    error,
    refetch: cargar,
    breadcrumbItems,
    busquedaInput,
    setBusquedaInput,
    esBusquedaActiva,
    busquedaMinChars: BUSQUEDA_MIN_CHARS,
    prelimLimit: PRELIM_LIMIT,
  };
};
