/**
 * Hook de API: planilla de avance de tutorías "10 en 10" (bimestral, 3er
 * año) — preview en pantalla (módulo TIT · Titulación, Requisito 3 —
 * extensión 2026-07-31).
 *
 * GET /proyectos-grado/reportes/planilla-avance-tercer-anio?carreraId=&gestionId=&bimestre=
 * — `carreraId` y `bimestre` son REQUERIDOS por el backend; sin ambos no se
 * consulta (evita 400 innecesarios mientras el usuario elige los filtros).
 * `dataKey` ('planillaAvanceTercerAnio') coincide con el `dataFieldName` del
 * backend.
 */

import { useEffect, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapPlanillaAvanceTercerAnio } from '@application-titulacion/proyectos-grado/mappers/tutoriaAvanceMapper';

/** Clave de datos = dataFieldName del backend (Requisito 3). */
export const PLANILLA_AVANCE_TERCER_ANIO_DATA_KEY = 'planillaAvanceTercerAnio';

export const usePlanillaAvanceTercerAnioApi = ({ carreraId, gestionId, bimestre } = {}) => {
  const [planilla, setPlanilla] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      if (carreraId == null || bimestre == null) {
        setPlanilla(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await proyectoGradoRepository.obtenerPlanillaAvanceTercerAnio({
          carreraId,
          gestionId: gestionId ?? undefined,
          bimestre,
        });
        if (!activo) return;
        if (result?.success) {
          const raw = result.data?.[PLANILLA_AVANCE_TERCER_ANIO_DATA_KEY] ?? result.data;
          setPlanilla(mapPlanillaAvanceTercerAnio(raw));
        } else {
          setPlanilla(null);
          setError(result?.error || 'No se pudo cargar la planilla de avance de tutorías');
        }
      } catch (err) {
        if (activo) {
          setPlanilla(null);
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
  }, [carreraId, gestionId, bimestre]);

  return useMemo(() => ({ planilla, loading, error }), [planilla, loading, error]);
};

export default usePlanillaAvanceTercerAnioApi;
