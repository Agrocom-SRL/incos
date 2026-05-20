/**
 * Página principal de calificaciones: cursos del docente agrupados por paralelo.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@application-auth';
import { useGetDocenteById } from '@application-docentes/hooks/api';
import { groupCursosPorParalelo } from '../utils/groupCursosPorParalelo.js';
import { resolveDocenteIdFromUsuario } from '../utils/resolveDocenteId.js';
import { isPlanListo, loadPlanCalificaciones } from '../utils/planCalificacionesStorage.js';

export const useCalificacionesCursosPage = () => {
  const navigate = useNavigate();
  const { usuario, isLoading: authLoading } = useAuthContext();
  const docenteIdFromUser = resolveDocenteIdFromUsuario(usuario);
  const [docenteIdOverride, setDocenteIdOverride] = useState(null);

  const docenteId = docenteIdOverride ?? docenteIdFromUser;
  const { docente, loading, error, getDocenteById } = useGetDocenteById();

  useEffect(() => {
    if (Number.isFinite(docenteId) && docenteId > 0) {
      getDocenteById(docenteId);
    }
  }, [docenteId, getDocenteById]);

  const assignments = docente?.assignments ?? [];
  const gruposParalelo = useMemo(() => groupCursosPorParalelo(assignments), [assignments]);

  const cursosConEstado = useMemo(
    () =>
      gruposParalelo.map((g) => ({
        ...g,
        cursos: g.cursos.map((c) => {
          const plan = loadPlanCalificaciones(c.asignacionId);
          return {
            ...c,
            planListo: isPlanListo(plan),
            planConfigurado: Boolean(plan?.configured),
          };
        }),
      })),
    [gruposParalelo],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Académico', href: '/academico' },
      { title: 'Calificaciones' },
    ],
    [],
  );

  const handleAbrirCurso = useCallback(
    (asignacionId, { irPlan = false } = {}) => {
      if (!asignacionId) return;
      const destino = irPlan
        ? `/academico/calificaciones/curso/${asignacionId}/plan`
        : `/academico/calificaciones/curso/${asignacionId}/notas`;
      navigate(destino, {
        state: { menuSidebarKey: 'ACA-CAL', asignacionId },
      });
    },
    [navigate],
  );

  const esDocente = Boolean(docenteIdFromUser);
  const necesitaSeleccionDocente = !authLoading && !docenteIdFromUser && !docenteIdOverride;

  return {
    authLoading,
    loading: authLoading || loading,
    error,
    esDocente,
    necesitaSeleccionDocente,
    docenteId,
    docenteNombre: docente?.profile?.nombreCompleto,
    gruposParalelo: cursosConEstado,
    breadcrumbItems,
    handleAbrirCurso,
    setDocenteIdOverride,
    refetch: () => docenteId && getDocenteById(docenteId),
  };
};
