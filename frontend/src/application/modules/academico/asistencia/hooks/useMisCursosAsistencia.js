/**
 * Cursos del docente para "Mis cursos" de Asistencia (gestión vigente).
 * Gemelo de useMisCursosCalificaciones (delgado): docente propio o vista coordinación.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCasesFactory } from '@container';
import { useRouteViewMode } from '@navigation/hooks/useRouteViewMode.js';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { planillaCursoPath, ASISTENCIA_VIEW_ROUTE_KEY } from '../utils/asistenciaPaths.js';

export const useMisCursosAsistencia = () => {
  const { contextId, contextName, isView } = useRouteViewMode(ASISTENCIA_VIEW_ROUTE_KEY);
  const docenteIdCoordinacion = contextId;
  const esVistaCoordinacion = isView('coordinacion');

  const [cursos, setCursos] = useState(null);
  const [docente, setDocente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.listarMisCursosAsistencia();
      const result = esVistaCoordinacion
        ? await uc.ejecutar({ docenteId: docenteIdCoordinacion })
        : await uc.ejecutar();

      if (!result?.success) {
        setError(result?.error || 'No se pudieron cargar los cursos');
        setCursos([]);
        return;
      }
      setDocente(result.data?.docente ?? null);
      setCursos(Array.isArray(result.data?.cursos) ? result.data.cursos : []);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los cursos');
      setCursos([]);
    } finally {
      setIsLoading(false);
    }
  }, [docenteIdCoordinacion, esVistaCoordinacion]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-ASI-MIS-CURSOS', 'ACA-ASI', null),
    [],
  );

  const tituloDocente = esVistaCoordinacion
    ? (contextName ?? docente?.nombre ?? 'Docente')
    : (docente?.nombre ?? 'Mis cursos');

  return {
    titulo: esVistaCoordinacion ? `Cursos de ${tituloDocente}` : 'Mis cursos',
    cursos,
    docente,
    esVistaCoordinacion,
    isLoading,
    error,
    refetch: cargar,
    breadcrumbItems,
    // El docente entra directo a la planilla a tomar asistencia (el calendario queda
    // como acción de administración dentro de la planilla, oculta para el docente).
    cursoPath: (cursoId) => (cursoId ? planillaCursoPath(cursoId) : '#'),
  };
};
