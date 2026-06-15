/**
 * Política institucional de la gestión (Nivel 1) — API backend.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCasesFactory } from '@container';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

export const usePoliticaInstitucional = () => {
  const [politica, setPolitica] = useState(null);
  const [politicaGestionAnterior, setPoliticaGestionAnterior] = useState(null);
  const [gestionVigente, setGestionVigente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.obtenerPoliticaInstitucional();
      const result = await uc.ejecutar();
      if (!result?.success) {
        setPolitica(null);
        setPoliticaGestionAnterior(null);
        setGestionVigente(null);
        setError(result?.error || 'No se pudo cargar la configuración');
        return;
      }
      const data = result.data ?? {};
      setPolitica(data.politica ?? null);
      setPoliticaGestionAnterior(data.politicaGestionAnterior ?? null);
      setGestionVigente(data.gestionVigente ?? data.politica?.gestionNombre ?? null);
    } catch (err) {
      setPolitica(null);
      setPoliticaGestionAnterior(null);
      setGestionVigente(null);
      setError(err?.message || 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = useCallback(
    async (cambios) => {
      setIsSaving(true);
      setError(null);
      try {
        const uc = useCasesFactory.guardarPoliticaInstitucional();
        const result = await uc.ejecutar(cambios);
        if (!result?.success) {
          const err = new Error(result?.error || 'No se pudo guardar');
          setError(err.message);
          throw err;
        }
        const data = result.data ?? {};
        if (data.politica) {
          setPolitica(data.politica);
        }
        await cargar();
        return data.politica;
      } catch (err) {
        setError(err?.message || 'Error al guardar');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [cargar],
  );

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-CAL-POLITICA', 'ACA-CAL', 'Configuración de notas'),
    [],
  );

  return {
    politica,
    politicaGestionAnterior,
    gestionVigente,
    isLoading,
    isSaving,
    error,
    refetch: cargar,
    guardar,
    breadcrumbItems,
  };
};
