/**
 * Mis cursos — docente logueado (sin :docenteId) o coordinación (con :docenteId).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@application-auth';
import { useCasesFactory } from '@container';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
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
  const { usuario } = useAuth();
  const esVistaCoordinacion = Boolean(docenteIdParam);

  const [cursos, setCursos] = useState(null);
  const [docente, setDocente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.listarMisCursosCalificaciones();
      const result = esVistaCoordinacion
        ? await uc.ejecutar({ docenteId: docenteIdParam })
        : await uc.ejecutar();

      if (!result?.success) {
        setDocente(null);
        setCursos(null);
        setError(result?.error || 'No se pudieron cargar los cursos');
        return;
      }

      const data = result.data ?? {};
      setDocente(data.docente ?? null);
      setCursos(Array.isArray(data.cursos) ? data.cursos : []);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los cursos');
      setCursos(null);
      setDocente(null);
    } finally {
      setIsLoading(false);
    }
  }, [docenteIdParam, esVistaCoordinacion]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const impersonacion = useMemo(() => {
    if (!esVistaCoordinacion || !docente) return null;
    const adminNombre =
      usuario?.username ||
      [usuario?.nombres, usuario?.apellidos].filter(Boolean).join(' ').trim() ||
      'Coordinación';
    return {
      activa: true,
      docenteId: docente.id,
      docenteNombre: docente.nombre,
      adminNombre,
    };
  }, [esVistaCoordinacion, docente, usuario]);

  const breadcrumbItems = useMemo(() => {
    if (esVistaCoordinacion && docente) {
      return createBreadcrumbItems('ACA-CAL-DOCENTE-CURSOS', 'ACA-CAL', 'Mis cursos');
    }
    return createBreadcrumbItems('ACA-CAL', 'ACA-CAL', 'Mis cursos');
  }, [esVistaCoordinacion, docente]);

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
