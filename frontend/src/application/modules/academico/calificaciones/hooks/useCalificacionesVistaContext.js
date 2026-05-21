/**
 * Contexto de vista coordinación (docente impersonado sin :docenteId en la URL).
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'incos:calificaciones-docente-coordinacion';

const leerStorage = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useCalificacionesVistaContext = () => {
  const location = useLocation();
  const stateDocenteId = location.state?.docenteId ?? null;
  const stateDocenteNombre = location.state?.docenteNombre ?? null;

  useEffect(() => {
    if (stateDocenteId != null) {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          docenteId: stateDocenteId,
          docenteNombre: stateDocenteNombre ?? null,
        }),
      );
    }
  }, [stateDocenteId, stateDocenteNombre]);

  const stored = useMemo(() => leerStorage(), [stateDocenteId]);

  const docenteIdCoordinacion = stateDocenteId ?? stored?.docenteId ?? null;
  const docenteNombreCoordinacion = stateDocenteNombre ?? stored?.docenteNombre ?? null;
  const esVistaCoordinacion = docenteIdCoordinacion != null;

  const limpiarContextoCoordinacion = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    docenteIdCoordinacion,
    docenteNombreCoordinacion,
    esVistaCoordinacion,
    limpiarContextoCoordinacion,
  };
};
