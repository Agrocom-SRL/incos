/**
 * Inicio del estudiante — resumen personal para la página `EstudianteDashboard`.
 *
 * Consume `GET /dashboard/mi-resumen` y expone datos ya en forma de vista
 * (reusando los mismos mapeos del dashboard admin): estudiante, carrera,
 * docentes, actividades y stats. SOLO LECTURA. Tolerante a fallos: si la fuente
 * falla, se devuelven valores vacíos + `error` para avisar sin romper la página.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@application-auth';
import DashboardRepository from '@infrastructure/repositories/DashboardRepository.js';
import { mapActividad, mapCarreraToDashboard, mapDocente } from './useDashboardData';

const ESTADO_INICIAL = {
  estudiante: { nombre: '', codigo: null },
  carrera: null,
  docentes: [],
  actividades: [],
  stats: { sesionesHoy: 0, sesionesMes: 0 },
  saldoPendiente: 0,
};

export const useEstudianteHome = (enabled = true) => {
  const { usuario } = useAuth();
  const [data, setData] = useState(ESTADO_INICIAL);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fallbackNombre =
    usuario?.vinculo_perfil?.nombre_completo || usuario?.username || 'estudiante';

  const cargar = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    const res = await DashboardRepository.obtenerMiResumen();

    if (res?.success && res.data) {
      const d = res.data;
      const s = d.stats || {};
      setData({
        estudiante: {
          nombre: d.estudiante?.nombre || fallbackNombre,
          codigo: d.estudiante?.codigo ?? null,
        },
        carrera: mapCarreraToDashboard(d.carrera),
        docentes: Array.isArray(d.docentes)
          ? d.docentes.map(mapDocente).filter(Boolean)
          : [],
        actividades: Array.isArray(d.actividades)
          ? d.actividades.map(mapActividad).filter(Boolean)
          : [],
        stats: {
          sesionesHoy: Number(s.sesionesHoy ?? 0),
          sesionesMes: Number(s.sesionesMes ?? 0),
        },
        saldoPendiente: Math.round(Number(d.saldoPendiente ?? 0)),
      });
    } else {
      // Tolerancia a fallos: conservamos el nombre del usuario autenticado.
      setData({ ...ESTADO_INICIAL, estudiante: { nombre: fallbackNombre, codigo: null } });
      if (res?.error) {
        setError(typeof res.error === 'string' ? res.error : res.error?.message);
      }
    }

    setLoading(false);
  }, [fallbackNombre, enabled]);

  useEffect(() => {
    // Cuando está deshabilitado no se hace fetch (cargar() corta de inmediato) y el
    // estado inicial ya es vacío con loading=false, así que no hace falta resetear.
    if (!enabled) return undefined;
    let cancelled = false;
    (async () => {
      if (!cancelled) {
        await cargar();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cargar, enabled]);

  return {
    estudiante: data.estudiante,
    carrera: data.carrera,
    docentes: data.docentes,
    actividades: data.actividades,
    stats: data.stats,
    saldoPendiente: data.saldoPendiente,
    loading,
    error,
    refetch: cargar,
  };
};

export default useEstudianteHome;
