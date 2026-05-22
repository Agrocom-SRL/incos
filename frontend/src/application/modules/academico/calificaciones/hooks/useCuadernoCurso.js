/**
 * Cuaderno por curso — estudiantes desde registro académico; evaluaciones/notas en caché local (Fase 2-bis).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { createCalificacionesBreadcrumbItems } from '../utils/calificacionesBreadcrumbs.js';
import { tituloBimestre, BIMESTRE_TITULOS } from '../utils/bimestreTitulos.js';
import {
  aplicarNotasCacheAEstudiantes,
  clearNotasEvaluacionCache,
  loadEvaluacionesCache,
  saveEvaluacionesCache,
} from '../utils/cuadernoLocalCache.js';
import { MIS_CURSOS_PATH, notasCursoPath } from '../utils/calificacionesPaths.js';
import { useCalificacionesVistaContext } from './useCalificacionesVistaContext.js';

const mapEstudiantesRegistro = (filas = []) =>
  filas.map((e, index) => ({
    id: e.id,
    nro: e.nro ?? index + 1,
    codigo: e.codigo ?? '',
    nombre: e.nombre ?? '',
    notas: {},
  }));

export const useCuadernoCurso = () => {
  const { asignacionId, n: bimestreRuta } = useParams();
  const cursoIdResolved = asignacionId;
  const { docenteIdCoordinacion, esVistaCoordinacion } = useCalificacionesVistaContext();

  const [base, setBase] = useState(null);
  const [cuaderno, setCuaderno] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const bimestreDesdeUrl = useMemo(() => {
    const n = Number(bimestreRuta);
    return n >= 1 && n <= 4 ? n : null;
  }, [bimestreRuta]);

  const aplicarBimestre = useCallback(
    (ctx, bimestreNum) => {
      const { docente, cursoList, estudiantesBase } = ctx;
      const bimestreVigente = Number(docente.bimestreVigente) || 1;
      const activo = Math.min(Math.max(bimestreNum, 1), bimestreVigente);
      const evaluaciones = loadEvaluacionesCache(cursoIdResolved, activo);
      const estudiantes = aplicarNotasCacheAEstudiantes(
        estudiantesBase,
        cursoIdResolved,
        activo,
      );
      return {
        curso: {
          id: cursoList.id,
          materia: cursoList.materia,
          materiaSigla: cursoList.materiaSigla ?? null,
          carrera: cursoList.carrera,
          carreraColor: cursoList.carreraColor ?? '#196b45',
          periodo: cursoList.periodo ?? cursoList.periodoNombre ?? null,
          paralelo: cursoList.paralelo,
          turno: cursoList.turno,
          estudiantes: cursoList.estudiantes,
        },
        docente,
        bimestreVigente,
        bimestreActivo: activo,
        bimestreTitulo: tituloBimestre(activo),
        evaluaciones,
        estudiantes,
        modoEdicion: activo === bimestreVigente,
      };
    },
    [cursoIdResolved],
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError(null);
      setBase(null);
      setCuaderno(null);
      try {
        const ucCursos = useCasesFactory.listarMisCursosCalificaciones();
        const resCursos = esVistaCoordinacion
          ? await ucCursos.ejecutar({ docenteId: docenteIdCoordinacion })
          : await ucCursos.ejecutar();

        if (!resCursos?.success) {
          throw new Error(resCursos?.error || 'No se pudo cargar el contexto del curso');
        }

        const data = resCursos.data ?? {};
        const docente = data.docente ?? null;
        const cursos = Array.isArray(data.cursos) ? data.cursos : [];
        const cursoList = cursos.find((c) => String(c.id) === String(cursoIdResolved));

        if (!docente || !cursoList) {
          const err = new Error('CURSO_NOT_FOUND');
          err.code = 'CURSO_NOT_FOUND';
          throw err;
        }

        const ucRegistro = useCasesFactory.obtenerRegistroNotasCurso();
        const resRegistro = await ucRegistro.ejecutar(cursoIdResolved);
        if (!resRegistro?.success) {
          throw new Error(resRegistro?.error || 'No se pudo cargar el listado de estudiantes');
        }

        const cursoRegistro = resRegistro.data?.curso ?? {};
        const cursoMerged = {
          ...cursoList,
          periodo: cursoList.periodo ?? cursoRegistro.periodo ?? null,
        };

        const estudiantesBase = mapEstudiantesRegistro(resRegistro.data?.estudiantes);
        if (cancelled) return;

        const ctx = { docente, cursoList: cursoMerged, estudiantesBase };
        setBase(ctx);

        const bimestreVigente = Number(docente.bimestreVigente) || 1;
        const activoInicial = bimestreDesdeUrl ?? bimestreVigente;
        setCuaderno(aplicarBimestre(ctx, activoInicial));
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || err);
          setBase(null);
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
  }, [
    cursoIdResolved,
    docenteIdCoordinacion,
    esVistaCoordinacion,
    aplicarBimestre,
  ]);

  useEffect(() => {
    if (!base || bimestreDesdeUrl == null || isLoading) return;
    setCuaderno(aplicarBimestre(base, bimestreDesdeUrl));
  }, [bimestreDesdeUrl, base, isLoading, aplicarBimestre]);

  const bimestreVigente = Number(base?.docente?.bimestreVigente ?? cuaderno?.bimestreVigente) || 1;
  const bimestreActivoResolved =
    cuaderno?.bimestreActivo ?? bimestreDesdeUrl ?? bimestreVigente;

  const persistirEvaluaciones = useCallback(
    (evaluacionesLista) => {
      saveEvaluacionesCache(cursoIdResolved, bimestreActivoResolved, evaluacionesLista);
      setCuaderno((prev) => (prev ? { ...prev, evaluaciones: evaluacionesLista } : prev));
    },
    [cursoIdResolved, bimestreActivoResolved],
  );

  const crearEvaluacion = useCallback(
    async (payload) => {
      const nueva = {
        id: `ev-${Date.now()}`,
        ...payload,
        bimestre: bimestreActivoResolved,
      };
      const actuales = cuaderno?.evaluaciones ?? [];
      persistirEvaluaciones([...actuales, nueva]);
      return nueva;
    },
    [cuaderno?.evaluaciones, bimestreActivoResolved, persistirEvaluaciones],
  );

  const editarEvaluacion = useCallback(
    async (evaluacionId, payload) => {
      const actuales = cuaderno?.evaluaciones ?? [];
      const siguientes = actuales.map((ev) =>
        ev.id === evaluacionId ? { ...ev, ...payload } : ev,
      );
      persistirEvaluaciones(siguientes);
      return siguientes.find((ev) => ev.id === evaluacionId);
    },
    [cuaderno?.evaluaciones, persistirEvaluaciones],
  );

  const eliminarEvaluacion = useCallback(
    async (evaluacionId) => {
      clearNotasEvaluacionCache(cursoIdResolved, bimestreActivoResolved, evaluacionId);
      const actuales = cuaderno?.evaluaciones ?? [];
      persistirEvaluaciones(actuales.filter((ev) => ev.id !== evaluacionId));
      setCuaderno((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          estudiantes: prev.estudiantes.map((est) => {
            const notas = { ...est.notas };
            delete notas[evaluacionId];
            return { ...est, notas };
          }),
        };
      });
    },
    [cuaderno?.evaluaciones, bimestreActivoResolved, cursoIdResolved, persistirEvaluaciones],
  );

  const resetearNotasEvaluacion = useCallback(
    (evaluacionId) => {
      clearNotasEvaluacionCache(cursoIdResolved, bimestreActivoResolved, evaluacionId);
      setCuaderno((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          estudiantes: prev.estudiantes.map((est) => {
            const notas = { ...est.notas };
            delete notas[evaluacionId];
            return { ...est, notas };
          }),
        };
      });
    },
    [cursoIdResolved, bimestreActivoResolved],
  );

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ucCursos = useCasesFactory.listarMisCursosCalificaciones();
      const resCursos = esVistaCoordinacion
        ? await ucCursos.ejecutar({ docenteId: docenteIdCoordinacion })
        : await ucCursos.ejecutar();
      if (!resCursos?.success) throw new Error(resCursos?.error);

      const docente = resCursos.data?.docente;
      const cursoList = (resCursos.data?.cursos ?? []).find(
        (c) => String(c.id) === String(cursoIdResolved),
      );
      const ucRegistro = useCasesFactory.obtenerRegistroNotasCurso();
      const resRegistro = await ucRegistro.ejecutar(cursoIdResolved);
      if (!resRegistro?.success) throw new Error(resRegistro?.error);

      const ctx = {
        docente,
        cursoList: { ...cursoList, periodo: cursoList?.periodo ?? resRegistro.data?.curso?.periodo },
        estudiantesBase: mapEstudiantesRegistro(resRegistro.data?.estudiantes),
      };
      setBase(ctx);
      setCuaderno(aplicarBimestre(ctx, bimestreActivoResolved));
    } catch (err) {
      setError(err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [
    aplicarBimestre,
    bimestreActivoResolved,
    cursoIdResolved,
    docenteIdCoordinacion,
    esVistaCoordinacion,
  ]);

  const breadcrumbItems = useMemo(() => {
    const n = bimestreActivoResolved;
    const tituloCrumb = n ? `Cuaderno · Bimestre ${n}` : 'Cuaderno';
    return createCalificacionesBreadcrumbItems('ACA-CAL-CUADERNO', 'ACA-CAL', tituloCrumb, {
      asignacionId: cursoIdResolved,
      n,
    });
  }, [bimestreActivoResolved, cursoIdResolved]);

  const tituloPagina = cuaderno?.bimestreTitulo
    ? `Cuaderno · ${cuaderno.bimestreTitulo}`
    : `Cuaderno · Bimestre ${bimestreActivoResolved}`;

  return {
    curso: cuaderno?.curso ?? null,
    docente: cuaderno?.docente ?? base?.docente ?? null,
    evaluaciones: cuaderno?.evaluaciones ?? [],
    estudiantes: cuaderno?.estudiantes ?? [],
    bimestreTitulos: BIMESTRE_TITULOS,
    bimestreTitulo: cuaderno?.bimestreTitulo ?? tituloBimestre(bimestreActivoResolved),
    bimestreVigente,
    bimestreActivo: bimestreActivoResolved,
    modoEdicion: cuaderno?.modoEdicion ?? false,
    isLoading,
    isRefetching: false,
    error,
    refetch,
    breadcrumbItems,
    tituloPagina,
    volverPath: cursoIdResolved ? notasCursoPath(cursoIdResolved) : MIS_CURSOS_PATH,
    cursoId: cursoIdResolved,
    esVistaCoordinacion,
    crearEvaluacion,
    editarEvaluacion,
    eliminarEvaluacion,
    resetearNotasEvaluacion,
  };
};
