/**
 * Mis cursos — docente logueado (sin :docenteId) o coordinación (con :docenteId).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { docenteCuadernoPath } from '../utils/calificacionesPaths.js';

const formatGestionLabel = (nombre) => {
  if (!nombre) return '';
  const s = String(nombre).trim();
  if (/^gesti[oó]n/i.test(s)) return s;
  return `Gestión ${s}`;
};

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

  const gestionLabel = formatGestionLabel(docente?.gestionVigente);
  const bimestreLabel =
    docente?.periodoLectivoEnCurso ?? docente?.bimestreNombre ?? null;

  const subtitulo = docente
    ? esVistaCoordinacion
      ? `Cursos de ${docente.nombre}${gestionLabel ? ` · ${gestionLabel}` : ''}`
      : gestionLabel || ''
    : '';

  const periodoLectivoLabel =
    bimestreLabel && gestionLabel
      ? `${bimestreLabel} (${gestionLabel})`
      : bimestreLabel || gestionLabel || '';

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
    esVistaCoordinacion,
    isLoading,
    error,
    refetch: cargar,
    breadcrumbItems,
    periodoLectivoLabel,
    cuadernoPath: (cursoId) =>
      docenteId ? docenteCuadernoPath(docenteId, cursoId) : '#',
  };
};
