/**
 * Cuaderno por curso — estudiantes desde registro; evaluaciones/notas desde API.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@application-auth';
import { useCasesFactory } from '@container';
import { CALIFICACIONES_PERMISOS } from '../utils/calificacionesPermisos.js';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { createCalificacionesBreadcrumbItems } from '../utils/calificacionesBreadcrumbs.js';
import { tituloBimestre, BIMESTRE_TITULOS } from '../utils/bimestreTitulos.js';
import {
  aplicarNotasCacheAEstudiantes,
  clearNotasEvaluacionCache,
  saveEvaluacionesCache,
} from '../utils/cuadernoLocalCache.js';
import { mergeNotasEnEstudiantes } from '../utils/mergeNotasCuaderno.js';
import {
  mapBimestresCalendario,
  periodoCalendarioPorNumero,
} from '../utils/bimestrePlazoUtils.js';
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
  const { hasPermiso } = useAuth();
  const { docenteIdCoordinacion, esVistaCoordinacion } = useCalificacionesVistaContext();

  const bimestreVigenteEditable = useCallback(
    (cuadernoState) => Boolean(cuadernoState?.modoEdicion),
    [],
  );

  const [base, setBase] = useState(null);
  const [cuaderno, setCuaderno] = useState(null);
  const [bimestresCalendario, setBimestresCalendario] = useState([]);
  const [gestionFechas, setGestionFechas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const bimestreDesdeUrl = useMemo(() => {
    const n = Number(bimestreRuta);
    return n >= 1 && n <= 4 ? n : null;
  }, [bimestreRuta]);

  const construirEstadoBimestre = useCallback(
    async (ctx, bimestreNum) => {
      const { docente, cursoList, estudiantesBase } = ctx;
      const bimestreVigente = Number(docente.bimestreVigente) || 1;
      const activo = Math.min(Math.max(bimestreNum, 1), 4);

      let evaluaciones = [];
      let estudiantes = estudiantesBase.map((e) => ({ ...e, notas: {} }));

      const resCuaderno = await CalificacionRepository.obtenerCuadernoBimestre(
        cursoIdResolved,
        activo,
      );

      if (resCuaderno?.success) {
        evaluaciones = resCuaderno.data?.evaluaciones ?? [];
        estudiantes = mergeNotasEnEstudiantes(estudiantesBase, resCuaderno.data?.notas ?? []);
        saveEvaluacionesCache(cursoIdResolved, activo, evaluaciones);
      } else {
        const cacheErr = resCuaderno?.error;
        if (cacheErr) {
          throw new Error(cacheErr);
        }
      }

      estudiantes = aplicarNotasCacheAEstudiantes(estudiantes, cursoIdResolved, activo);

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
        const calendarioFallback = mapBimestresCalendario(
          data.bimestresCalendario ?? docente?.bimestresCalendario,
        );
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

        setBimestresCalendario(
          mapBimestresCalendario(
            resRegistro.data?.bimestresCalendario?.length
              ? resRegistro.data.bimestresCalendario
              : calendarioFallback,
          ),
        );
        setGestionFechas(
          resRegistro.data?.gestion?.fechaFin
            ? resRegistro.data.gestion
            : data.gestion ?? docente?.gestion ?? null,
        );

        const ctx = { docente, cursoList: cursoMerged, estudiantesBase };
        setBase(ctx);

        const bimestreVigente = Number(docente.bimestreVigente) || 1;
        const activoInicial = bimestreDesdeUrl ?? bimestreVigente;
        const estado = await construirEstadoBimestre(ctx, activoInicial);
        if (!cancelled) setCuaderno(estado);
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
  }, [cursoIdResolved, docenteIdCoordinacion, esVistaCoordinacion, construirEstadoBimestre]);

  useEffect(() => {
    if (!base || bimestreDesdeUrl == null || isLoading) return;
    let cancelled = false;

    const syncBimestre = async () => {
      try {
        const estado = await construirEstadoBimestre(base, bimestreDesdeUrl);
        if (!cancelled) setCuaderno(estado);
      } catch (err) {
        if (!cancelled) setError(err?.message || err);
      }
    };

    syncBimestre();
    return () => {
      cancelled = true;
    };
  }, [bimestreDesdeUrl, base, isLoading, construirEstadoBimestre]);

  const bimestreVigente = Number(base?.docente?.bimestreVigente ?? cuaderno?.bimestreVigente) || 1;
  const bimestreActivoResolved =
    cuaderno?.bimestreActivo ?? bimestreDesdeUrl ?? bimestreVigente;

  const periodoBimestreActivo = useMemo(
    () => periodoCalendarioPorNumero(bimestresCalendario, bimestreActivoResolved),
    [bimestresCalendario, bimestreActivoResolved],
  );

  const persistirEvaluaciones = useCallback(
    (evaluacionesLista) => {
      saveEvaluacionesCache(cursoIdResolved, bimestreActivoResolved, evaluacionesLista);
      setCuaderno((prev) => (prev ? { ...prev, evaluaciones: evaluacionesLista } : prev));
    },
    [cursoIdResolved, bimestreActivoResolved],
  );

  const crearEvaluacion = useCallback(
    async (payload) => {
      const res = await CalificacionRepository.crearEvaluacionCuaderno(
        cursoIdResolved,
        bimestreActivoResolved,
        payload,
      );
      if (!res?.success) {
        throw new Error(res?.error || 'No se pudo crear la evaluación');
      }
      const nueva = res.data?.evaluacion ?? res.data;
      const actuales = cuaderno?.evaluaciones ?? [];
      persistirEvaluaciones([...actuales, nueva]);
      return nueva;
    },
    [cuaderno?.evaluaciones, bimestreActivoResolved, cursoIdResolved, persistirEvaluaciones],
  );

  const editarEvaluacion = useCallback(
    async (evaluacionId, payload) => {
      const res = await CalificacionRepository.editarEvaluacionCuaderno(
        cursoIdResolved,
        bimestreActivoResolved,
        evaluacionId,
        payload,
      );
      if (!res?.success) {
        throw new Error(res?.error || 'No se pudo actualizar la evaluación');
      }
      const actualizada = res.data?.evaluacion ?? res.data;
      const actuales = cuaderno?.evaluaciones ?? [];
      const siguientes = actuales.map((ev) =>
        ev.id === evaluacionId ? { ...ev, ...actualizada } : ev,
      );
      persistirEvaluaciones(siguientes);
      return siguientes.find((ev) => ev.id === evaluacionId);
    },
    [cuaderno?.evaluaciones, bimestreActivoResolved, cursoIdResolved, persistirEvaluaciones],
  );

  const eliminarEvaluacion = useCallback(
    async (evaluacionId) => {
      const res = await CalificacionRepository.eliminarEvaluacionCuaderno(
        cursoIdResolved,
        bimestreActivoResolved,
        evaluacionId,
      );
      if (!res?.success) {
        throw new Error(res?.error || 'No se pudo eliminar la evaluación');
      }
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
    async (evaluacionId) => {
      const res = await CalificacionRepository.resetearNotasEvaluacionCuaderno(
        cursoIdResolved,
        bimestreActivoResolved,
        evaluacionId,
      );
      if (!res?.success) {
        throw new Error(res?.error || 'No se pudieron restablecer las notas');
      }
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
    if (!base) return;
    setIsLoading(true);
    setError(null);
    try {
      const estado = await construirEstadoBimestre(base, bimestreActivoResolved);
      setCuaderno(estado);
    } catch (err) {
      setError(err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [base, bimestreActivoResolved, construirEstadoBimestre]);

  const materiaCurso = cuaderno?.curso?.materia ?? base?.cursoList?.materia ?? null;

  const breadcrumbItems = useMemo(() => {
    const n = bimestreActivoResolved;
    const tituloCrumb = n ? `Cuaderno · Bimestre ${n}` : 'Cuaderno';
    return createCalificacionesBreadcrumbItems('ACA-CAL-CUADERNO', 'ACA-CAL', tituloCrumb, {
      asignacionId: cursoIdResolved,
      n,
      materia: materiaCurso,
    });
  }, [bimestreActivoResolved, cursoIdResolved, materiaCurso]);

  const tituloPagina = cuaderno?.bimestreTitulo
    ? `Cuaderno · ${cuaderno.bimestreTitulo}`
    : `Cuaderno · Bimestre ${bimestreActivoResolved}`;

  const vigenteEditable = bimestreVigenteEditable(cuaderno);

  const puedeCrearEvaluacion = useMemo(
    () => vigenteEditable && hasPermiso(CALIFICACIONES_PERMISOS.cuadernoEvaluaciones, 'CREAR'),
    [vigenteEditable, hasPermiso],
  );
  const puedeEditarEvaluacion = useMemo(
    () => vigenteEditable && hasPermiso(CALIFICACIONES_PERMISOS.cuadernoEvaluaciones, 'EDITAR'),
    [vigenteEditable, hasPermiso],
  );
  const puedeEliminarEvaluacion = useMemo(
    () => vigenteEditable && hasPermiso(CALIFICACIONES_PERMISOS.cuadernoEvaluaciones, 'ELIMINAR'),
    [vigenteEditable, hasPermiso],
  );
  const puedeEditarNotas = useMemo(
    () => vigenteEditable && hasPermiso(CALIFICACIONES_PERMISOS.cuadernoNotas, 'EDITAR'),
    [vigenteEditable, hasPermiso],
  );
  const puedeGuardarBimestre = useMemo(
    () => vigenteEditable && hasPermiso(CALIFICACIONES_PERMISOS.cuadernoGuardar, 'EDITAR'),
    [vigenteEditable, hasPermiso],
  );

  const modoEdicion =
    puedeCrearEvaluacion ||
    puedeEditarEvaluacion ||
    puedeEliminarEvaluacion ||
    puedeEditarNotas ||
    puedeGuardarBimestre;

  return {
    curso: cuaderno?.curso ?? null,
    docente: cuaderno?.docente ?? base?.docente ?? null,
    evaluaciones: cuaderno?.evaluaciones ?? [],
    estudiantes: cuaderno?.estudiantes ?? [],
    bimestreTitulos: BIMESTRE_TITULOS,
    bimestreTitulo: cuaderno?.bimestreTitulo ?? tituloBimestre(bimestreActivoResolved),
    bimestreVigente,
    bimestreActivo: bimestreActivoResolved,
    periodoBimestreActivo,
    gestionFechaFin: gestionFechas?.fechaFin ?? null,
    modoEdicion,
    puedeCrearEvaluacion,
    puedeEditarEvaluacion,
    puedeEliminarEvaluacion,
    puedeEditarNotas,
    puedeGuardarBimestre,
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
