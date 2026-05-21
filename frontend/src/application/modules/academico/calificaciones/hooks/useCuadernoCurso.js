/**
 * Cuaderno por curso — contexto docente vía API; grilla pendiente de endpoint cuaderno.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { MIS_CURSOS_PATH, notasCursoPath } from '../utils/calificacionesPaths.js';
import { useCalificacionesVistaContext } from './useCalificacionesVistaContext.js';

const CUADERNO_API_PENDIENTE =
  'El cuaderno de notas aún no está conectado al backend. Mis cursos y política ya usan API real.';

const bimestresPorDefecto = (vigente) =>
  [1, 2, 3, 4].map((numero) => {
    if (numero < vigente) return { numero, estado: 'cerrado' };
    if (numero === vigente) return { numero, estado: 'vigente' };
    return { numero, estado: 'bloqueado' };
  });

export const useCuadernoCurso = () => {
  const { asignacionId, n: bimestreRuta } = useParams();
  const cursoIdResolved = asignacionId;
  const { docenteIdCoordinacion, esVistaCoordinacion } = useCalificacionesVistaContext();

  const [cuaderno, setCuaderno] = useState(null);
  const [bimestreActivo, setBimestreActivoState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState(null);
  const [docenteCtx, setDocenteCtx] = useState(null);

  const cargarContexto = useCallback(async () => {
    const uc = useCasesFactory.listarMisCursosCalificaciones();
    const result = esVistaCoordinacion
      ? await uc.ejecutar({ docenteId: docenteIdCoordinacion })
      : await uc.ejecutar();

    if (!result?.success) {
      throw new Error(result?.error || 'No se pudo cargar el contexto del curso');
    }

    const data = result.data ?? {};
    const docente = data.docente ?? null;
    const cursos = Array.isArray(data.cursos) ? data.cursos : [];
    const cursoList = cursos.find((c) => String(c.id) === String(cursoIdResolved));

    if (!docente || !cursoList) {
      const err = new Error('CURSO_NOT_FOUND');
      err.code = 'CURSO_NOT_FOUND';
      throw err;
    }

    return { docente, cursoList };
  }, [cursoIdResolved, docenteIdCoordinacion, esVistaCoordinacion]);

  const armarCuadernoVacio = useCallback((docente, cursoList, bimestreActivoNum) => {
    const bimestreVigente = Number(docente.bimestreVigente) || 1;
    const activo = bimestreActivoNum ?? bimestreVigente;
    return {
      curso: {
        id: cursoList.id,
        materia: cursoList.materia,
        carrera: cursoList.carrera,
        paralelo: cursoList.paralelo,
        turno: cursoList.turno,
        estudiantes: cursoList.estudiantes,
      },
      bimestreVigente,
      bimestreActivo: activo,
      bimestres: bimestresPorDefecto(bimestreVigente),
      evaluaciones: [],
      estudiantes: [],
      modoEdicion: activo === bimestreVigente,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError(null);
      setCuaderno(null);
      try {
        const { docente, cursoList } = await cargarContexto();
        if (cancelled) return;

        setDocenteCtx(docente);
        const bimestreVigente = Number(docente.bimestreVigente) || 1;
        setBimestreActivoState(bimestreVigente);

        setCuaderno(armarCuadernoVacio(docente, cursoList, bimestreVigente));
        setError(CUADERNO_API_PENDIENTE);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || err);
          setCuaderno(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [cursoIdResolved, docenteIdCoordinacion, esVistaCoordinacion, cargarContexto, armarCuadernoVacio]);

  useEffect(() => {
    if (bimestreRuta != null) {
      const n = Number(bimestreRuta);
      if (n >= 1 && n <= 4) setBimestreActivoState(n);
    }
  }, [bimestreRuta]);

  const setBimestreActivo = useCallback((numero) => {
    const vigente = docenteCtx?.bimestreVigente ?? 1;
    if (numero > vigente) return;
    setBimestreActivoState(numero);
    setCuaderno((prev) =>
      prev
        ? {
            ...prev,
            bimestreActivo: numero,
            bimestres: bimestresPorDefecto(vigente),
            modoEdicion: numero === vigente,
          }
        : prev,
    );
  }, [docenteCtx?.bimestreVigente]);

  const refetch = useCallback(() => {
    setError(CUADERNO_API_PENDIENTE);
  }, []);

  const operacionNoDisponible = useCallback(async () => {
    throw new Error(CUADERNO_API_PENDIENTE);
  }, []);

  const bimestreVigente = Number(docenteCtx?.bimestreVigente ?? cuaderno?.bimestreVigente) || 1;

  const breadcrumbItems = useMemo(() => {
    const materia = cuaderno?.curso?.materia ?? null;
    const n = bimestreActivo ?? bimestreVigente;
    const titulo =
      materia && n ? `Cuaderno · Bimestre ${n}` : materia;
    return createBreadcrumbItems('ACA-CAL-CUADERNO', 'ACA-CAL', titulo);
  }, [cuaderno?.curso?.materia, bimestreActivo, bimestreVigente]);

  const subtituloCurso = cuaderno
    ? [
        cuaderno.curso.carrera,
        `Paralelo ${cuaderno.curso.paralelo}`,
        cuaderno.curso.turno,
        `${cuaderno.curso.estudiantes} estudiantes`,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return {
    curso: cuaderno?.curso ?? null,
    evaluaciones: cuaderno?.evaluaciones ?? [],
    estudiantes: cuaderno?.estudiantes ?? [],
    bimestres: cuaderno?.bimestres ?? bimestresPorDefecto(bimestreVigente),
    bimestreVigente,
    bimestreActivo: bimestreActivo ?? bimestreVigente,
    modoEdicion: bimestreActivo === bimestreVigente && cuaderno?.modoEdicion,
    setBimestreActivo,
    isLoading,
    isRefetching,
    error,
    refetch,
    breadcrumbItems,
    subtituloCurso,
    volverPath: cursoIdResolved ? notasCursoPath(cursoIdResolved) : MIS_CURSOS_PATH,
    cursoId: cursoIdResolved,
    esVistaCoordinacion,
    crearEvaluacion: operacionNoDisponible,
    editarEvaluacion: operacionNoDisponible,
    eliminarEvaluacion: operacionNoDisponible,
  };
};
