/**
 * Hook de API: reporte de avance de tutorías por carrera (módulo TIT ·
 * Titulación, Requisito 2 — extensión 2026-07-31).
 *
 * GET /proyectos-grado/reportes/avance-carrera?gestionId=&carreraId= — sin
 * `gestionId` el backend usa la gestión vigente; sin `carreraId` trae el
 * resumen de TODAS las carreras. Reactivo a los filtros de la pantalla.
 * `dataKey` ('avanceTutoriaCarrera') coincide con el `dataFieldName` del
 * backend.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapAvanceTutoriaCarrera } from '@application-titulacion/proyectos-grado/mappers/tutoriaAvanceMapper';

/** Clave de datos = dataFieldName del backend (Requisito 2). */
export const AVANCE_TUTORIA_CARRERA_DATA_KEY = 'avanceTutoriaCarrera';

export const useAvanceTutoriaCarreraApi = ({ gestionId, carreraId } = {}) => {
  const [avance, setAvance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    let result = null;
    try {
      result = await proyectoGradoRepository.obtenerAvanceTutoriaCarrera({
        gestionId: gestionId ?? undefined,
        carreraId: carreraId ?? undefined,
      });
      if (result?.success) {
        const raw = result.data?.[AVANCE_TUTORIA_CARRERA_DATA_KEY] ?? result.data;
        setAvance(mapAvanceTutoriaCarrera(raw));
      } else {
        setAvance(null);
        setError(result?.error || 'No se pudo cargar el reporte de avance de tutorías por carrera');
      }
    } catch (err) {
      setAvance(null);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
    return result;
  }, [gestionId, carreraId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return useMemo(
    () => ({ avance, loading, error, refetch: cargar }),
    [avance, loading, error, cargar],
  );
};

export default useAvanceTutoriaCarreraApi;
