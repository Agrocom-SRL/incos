/**
 * Mis cursos — docente logueado (sin :docenteId) o coordinación (con :docenteId + impersonación).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { calificacionesFakeApi } from '../fake-api/index.js';
import { docenteCuadernoPath } from '../utils/calificacionesPaths.js';

const getResumenCursos = (cursos) => {
  const paralelos = new Set(cursos.map((c) => c.paralelo));
  return {
    totalCursos: cursos.length,
    totalParalelos: paralelos.size,
  };
};

export const useMisCursosCalificaciones = () => {
  const { docenteId: docenteIdParam } = useParams();
  const esVistaCoordinacion = Boolean(docenteIdParam);

  const [cursos, setCursos] = useState(null);
  const [docente, setDocente] = useState(null);
  const [impersonacion, setImpersonacion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (esVistaCoordinacion) {
        const data = await calificacionesFakeApi.obtenerCursosDocenteAdmin({
          docenteId: docenteIdParam,
        });
        setDocente(data.docente);
        setCursos(data.cursos);
        setImpersonacion(data.impersonacion);
      } else {
        const data = await calificacionesFakeApi.obtenerCalificacionesCursos();
        setDocente(data.docente);
        setCursos(data.cursos);
        setImpersonacion(null);
      }
    } catch (err) {
      setError(err);
      setCursos(null);
      setDocente(null);
      setImpersonacion(null);
    } finally {
      setIsLoading(false);
    }
  }, [docenteIdParam, esVistaCoordinacion]);

  useEffect(() => {
    cargar();
    return () => {
      if (esVistaCoordinacion) {
        calificacionesFakeApi.desactivarImpersonacion().catch(() => {});
      }
    };
  }, [cargar, esVistaCoordinacion]);

  const breadcrumbItems = useMemo(() => {
    if (esVistaCoordinacion && docente) {
      return createBreadcrumbItems('ACA-CAL-DOCENTE-CURSOS', 'ACA-CAL', 'Mis cursos');
    }
    return createBreadcrumbItems('ACA-CAL', 'ACA-CAL', 'Mis cursos');
  }, [esVistaCoordinacion, docente?.nombre]);

  const resumen = useMemo(
    () => (cursos ? getResumenCursos(cursos) : { totalCursos: 0, totalParalelos: 0 }),
    [cursos],
  );

  const titulo = esVistaCoordinacion
    ? 'Mis cursos'
    : docente
      ? `Buen día, ${docente.nombre}`
      : 'Mis cursos';

  const subtitulo = docente
    ? esVistaCoordinacion
      ? `${docente.nombre} · Gestión ${docente.gestionVigente} · Bimestre ${docente.bimestreVigente}`
      : `Gestión ${docente.gestionVigente} · Bimestre ${docente.bimestreVigente} vigente`
    : '';

  const contextoLinea = cursos
    ? esVistaCoordinacion
      ? `${resumen.totalCursos} cursos · ${resumen.totalParalelos} paralelos`
      : `${resumen.totalCursos} cursos activos · ${resumen.totalParalelos} paralelos`
    : '';

  const docenteId = docente?.id ?? docenteIdParam;

  return {
    titulo,
    subtitulo,
    contextoLinea,
    cursos,
    docente,
    impersonacion,
    esVistaCoordinacion,
    isLoading,
    error,
    refetch: cargar,
    breadcrumbItems,
    cuadernoPath: (cursoId) =>
      docenteId ? docenteCuadernoPath(docenteId, cursoId) : '#',
  };
};
