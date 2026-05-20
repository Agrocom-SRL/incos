/**
 * Cursos del docente agrupados por paralelo (tras elegir docente o cuenta DOCENTE).
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '@application-auth';
import { useGetDocenteById } from '@application-docentes/hooks/api';
import { groupCursosPorParalelo } from '../utils/groupCursosPorParalelo.js';
import { resolveDocenteIdFromUsuario } from '../utils/resolveDocenteId.js';
import {
  CALIFICACIONES_SELECCION_PATH,
  calificacionesNotasPath,
  calificacionesPlanPath,
} from '../utils/calificacionesPaths.js';
import { isPlanListo, loadPlanCalificaciones } from '../utils/planCalificacionesStorage.js';
import { buildResumenDocente } from '../utils/calificacionesDisplay.js';

export const useCalificacionesCursosPage = () => {
  const navigate = useNavigate();
  const { docenteId: docenteIdParam } = useParams();
  const { usuario, isLoading: authLoading } = useAuthContext();
  const docenteIdFromUser = resolveDocenteIdFromUsuario(usuario);
  const docenteId = Number(docenteIdParam);

  const esDocente = Boolean(docenteIdFromUser);
  const docenteIdValido = Number.isFinite(docenteId) && docenteId > 0;

  const { docente, loading, error, getDocenteById } = useGetDocenteById();

  useEffect(() => {
    if (docenteIdValido) {
      getDocenteById(docenteId);
    }
  }, [docenteId, docenteIdValido, getDocenteById]);

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
      {
        title: 'Calificaciones',
        href: esDocente ? undefined : CALIFICACIONES_SELECCION_PATH,
      },
      { title: docente?.profile?.nombreCompleto || 'Cursos' },
    ],
    [esDocente, docente?.profile?.nombreCompleto],
  );

  const handleAbrirCurso = useCallback(
    (asignacionId, { irPlan = false } = {}) => {
      if (!asignacionId || !docenteIdValido) return;
      const destino = irPlan
        ? calificacionesPlanPath(docenteId, asignacionId)
        : calificacionesNotasPath(docenteId, asignacionId);
      navigate(destino, {
        state: { menuSidebarKey: 'ACA-CAL', asignacionId, docenteId },
      });
    },
    [navigate, docenteId, docenteIdValido],
  );

  const handleVolverSeleccion = useCallback(() => {
    navigate(CALIFICACIONES_SELECCION_PATH, { state: { menuSidebarKey: 'ACA-CAL' } });
  }, [navigate]);

  const resumenDocente = useMemo(() => buildResumenDocente(cursosConEstado), [cursosConEstado]);

  return {
    authLoading,
    loading: authLoading || (docenteIdValido && loading),
    error: !docenteIdValido ? 'Docente no válido.' : error,
    esDocente,
    docenteId,
    docenteIdValido,
    docente,
    docenteNombre: docente?.profile?.nombreCompleto,
    docenteTitulo: docente?.profile?.tituloProfesional || docente?.profile?.especialidad,
    resumenDocente,
    gruposParalelo: cursosConEstado,
    breadcrumbItems,
    handleAbrirCurso,
    handleVolverSeleccion,
    refetch: () => docenteIdValido && getDocenteById(docenteId),
  };
};
