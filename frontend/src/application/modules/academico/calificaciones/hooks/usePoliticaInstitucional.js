/**
 * Política institucional de la gestión (Nivel 1).
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { calificacionesFakeApi } from '../fake-api/index.js';

export const usePoliticaInstitucional = () => {
  const { gestionId: gestionIdParam } = useParams();
  const gestionId = gestionIdParam ?? '1';

  const [politica, setPolitica] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await calificacionesFakeApi.obtenerPoliticaInstitucional({ gestionId });
      setPolitica(data);
    } catch (err) {
      setError(err);
      setPolitica(null);
    } finally {
      setIsLoading(false);
    }
  }, [gestionId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = useCallback(
    async (cambios) => {
      setIsSaving(true);
      setError(null);
      try {
        const data = await calificacionesFakeApi.guardarPoliticaInstitucional({
          gestionId,
          cambios,
        });
        setPolitica(data);
        return data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [gestionId],
  );

  const breadcrumbItems = createBreadcrumbItems(
    'ACA-CAL-POLITICA',
    'ACA-CAL',
    'Política institucional',
  );

  return {
    politica,
    gestionId,
    isLoading,
    isSaving,
    error,
    refetch: cargar,
    guardar,
    breadcrumbItems,
  };
};
