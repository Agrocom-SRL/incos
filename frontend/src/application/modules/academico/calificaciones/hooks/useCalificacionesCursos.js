/**
 * Pantalla de inicio del módulo Calificaciones (lista de cursos del docente).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { calificacionesFakeApi } from '../fake-api/index.js';
import { cuadernoCursoPath } from '../utils/calificacionesPaths.js';

const getResumenCursos = (cursos) => {
  const paralelos = new Set(cursos.map((c) => c.paralelo));
  return {
    totalCursos: cursos.length,
    totalParalelos: paralelos.size,
  };
};

export const useCalificacionesCursos = () => {
  const [cursos, setCursos] = useState(null);
  const [docente, setDocente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await calificacionesFakeApi.obtenerCalificacionesCursos();
      setDocente(data.docente);
      setCursos(data.cursos);
    } catch (err) {
      setError(err);
      setCursos(null);
      setDocente(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-CAL', 'ACA-CAL', 'Calificaciones'),
    [],
  );

  const resumen = useMemo(
    () => (cursos ? getResumenCursos(cursos) : { totalCursos: 0, totalParalelos: 0 }),
    [cursos],
  );

  const titulo = docente ? `Buen día, ${docente.nombre}` : 'Mis cursos';
  const subtitulo = docente
    ? `Gestión ${docente.gestionVigente} · Bimestre ${docente.bimestreVigente} vigente`
    : '';
  const contextoLinea = cursos
    ? `${resumen.totalCursos} cursos activos · ${resumen.totalParalelos} paralelos`
    : '';

  return {
    titulo,
    subtitulo,
    contextoLinea,
    cursos,
    docente,
    isLoading,
    error,
    refetch: cargar,
    breadcrumbItems,
    cuadernoPath: cuadernoCursoPath,
  };
};
