/**
 * Hook de API: seguimiento de tutorías a docentes (reporte ADMINISTRATIVO de
 * seguimiento A LOS DOCENTES-TUTORES, módulo TIT · Titulación, extensión
 * 2026-08-10 — reemplaza la planilla de avance "10 en 10" de 3er año).
 *
 * GET /proyectos-grado/reportes/seguimiento-tutoria-docentes?docenteId=&carreraId=&anio=&mes=
 * — todos los filtros son OPCIONALES y NUNCA bloquean la carga: sin
 * `anio`/`mes` el backend resuelve el mes/año actual del servidor. `dataKey`
 * ('seguimientoTutoriaDocentes') coincide con el `dataFieldName` del backend.
 */

import { useEffect, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapSeguimientoTutoriaDocentes } from '@application-titulacion/proyectos-grado/mappers/tutoriaAvanceMapper';

/** Clave de datos = dataFieldName del backend. */
export const SEGUIMIENTO_TUTORIA_DOCENTES_DATA_KEY = 'seguimientoTutoriaDocentes';

export const useSeguimientoTutoriaDocentesApi = ({ docenteId, carreraId, anio, mes } = {}) => {
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await proyectoGradoRepository.obtenerSeguimientoTutoriaDocentes({
          docenteId: docenteId ?? undefined,
          carreraId: carreraId ?? undefined,
          anio: anio ?? undefined,
          mes: mes ?? undefined,
        });
        if (!activo) return;
        if (result?.success) {
          const raw = result.data?.[SEGUIMIENTO_TUTORIA_DOCENTES_DATA_KEY] ?? result.data;
          setSeguimiento(mapSeguimientoTutoriaDocentes(raw));
        } else {
          setSeguimiento(null);
          setError(result?.error || 'No se pudo cargar el seguimiento de tutorías a docentes');
        }
      } catch (err) {
        if (activo) {
          setSeguimiento(null);
          setError(err?.message || String(err));
        }
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [docenteId, carreraId, anio, mes]);

  return useMemo(() => ({ seguimiento, loading, error }), [seguimiento, loading, error]);
};

export default useSeguimientoTutoriaDocentesApi;
