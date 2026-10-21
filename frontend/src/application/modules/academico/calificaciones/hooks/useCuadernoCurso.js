/**
 * Cuaderno por curso — estudiantes desde registro; evaluaciones/notas desde API.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@application-auth';
import { useAcciones } from '@application-shared/hooks';
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
import { periodoCalendarioPorNumero } from '../utils/bimestrePlazoUtils.js';
import { MIS_CURSOS_PATH, notasCursoPath, CALIFICACIONES_VIEW_ROUTE_KEY } from '../utils/calificacionesPaths.js';
import { useRouteViewMode } from '@navigation/hooks/useRouteViewMode.js';
import { cargarContextoCursoRegistro } from '../utils/cargarContextoCursoRegistro.js';

export const useCuadernoCurso = () => {
  const { asignacionId, n: bimestreRuta } = useParams();
  const navigate = useNavigate();
  const cursoIdResolved = asignacionId;
  const { hasPermiso } = useAuth();
  const { isView } = useRouteViewMode(CALIFICACIONES_VIEW_ROUTE_KEY);
  const esVistaCoordinacion = isView('coordinacion');
  const ajusteAdmin = useAcciones(CALIFICACIONES_PERMISOS.bimestreAjusteAdmin);

  const [base, setBase] = useState(null);
  const [cuaderno, setCuaderno] = useState(null);
  const [bimestresCalendario, setBimestresCalendario] = useState([]);
  const [gestionFechas, setGestionFechas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState(null);

  const bimestreDesdeUrl = useMemo(() => {
    const n = Number(bimestreRuta);
    return n >= 1 && n <= 4 ? n : null;
  }, [bimestreRuta]);

  const construirEstadoBimestre = useCallback(
    async (ctx, bimestreNum, calendario = []) => {
      const { docente, curso, estudiantesBase } = ctx;
      const bimestreVigente = Number(docente.bimestreVigente) || 1;
      const activo = Math.min(Math.max(bimestreNum, 1), 4);

      let evaluaciones = [];
      let estudiantes = estudiantesBase.map((e) => ({ ...e, notas: {} }));
      let reabierto = Boolean(
        (calendario ?? []).find((b) => Number(b.numero) === activo)?.reabierto,
      );

      const resCuaderno = await CalificacionRepository.obtenerCuadernoBimestre(
        cursoIdResolved,
        activo,
      );

      if (resCuaderno?.success) {
        evaluaciones = resCuaderno.data?.evaluaciones ?? [];
        estudiantes = mergeNotasEnEstudiantes(estudiantesBase, resCuaderno.data?.notas ?? []);
        reabierto = Boolean(resCuaderno.data?.reabierto) || reabierto;
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
          id: curso.id,
          materia: curso.materia,
          materiaSigla: curso.materiaSigla ?? null,
          carrera: curso.carrera,
          carreraColor: curso.carreraColor ?? '#196b45',
          periodo: curso.periodo ?? null,
          paralelo: curso.paralelo,
          turno: curso.turno,
          estudiantes: curso.estudiantes,
        },
        docente,
        bimestreVigente,
        bimestreActivo: activo,
        bimestreTitulo: tituloBimestre(activo),
        evaluaciones,
        estudiantes,
        reabierto,
        modoEdicion: activo === bimestreVigente || reabierto,
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
        const registro = await cargarContextoCursoRegistro(cursoIdResolved);
        if (cancelled) return;

        setBimestresCalendario(registro.bimestresCalendario);
        setGestionFechas(registro.gestionFechas);

        const ctx = {
          docente: registro.docente,
          curso: registro.curso,
          estudiantesBase: registro.estudiantesBase,
        };
        setBase(ctx);

        const activoInicial = bimestreDesdeUrl ?? registro.bimestreVigente;
        const estado = await construirEstadoBimestre(
          ctx,
          activoInicial,
          registro.bimestresCalendario,
        );
        if (!cancelled) setCuaderno(estado);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || err);
          setBase(null);
          setCuaderno(null);
          if (err?.code === 'CURSO_NOT_FOUND') {
            navigate(MIS_CURSOS_PATH, { replace: true });
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- init solo al cambiar de curso; bimestreDesdeUrl se aplica en el efecto siguiente
  }, [cursoIdResolved, construirEstadoBimestre, navigate]);

  useEffect(() => {
    if (!base || bimestreDesdeUrl == null || isLoading) return;
    if (cuaderno?.bimestreActivo === bimestreDesdeUrl) return;
    let cancelled = false;

    const syncBimestre = async () => {
      setIsRefetching(true);
      setError(null);
      try {
        const estado = await construirEstadoBimestre(base, bimestreDesdeUrl, bimestresCalendario);
        if (!cancelled) setCuaderno(estado);
      } catch (err) {
        if (!cancelled) setError(err?.message || err);
      } finally {
        if (!cancelled) setIsRefetching(false);
      }
    };

    syncBimestre();
    return () => {
      cancelled = true;
      setIsRefetching(false);
    };
  }, [bimestreDesdeUrl, base, isLoading, cuaderno?.bimestreActivo, construirEstadoBimestre, bimestresCalendario]);

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
    setIsRefetching(true);
    setError(null);
    try {
      const registro = await cargarContextoCursoRegistro(cursoIdResolved);
      setBimestresCalendario(registro.bimestresCalendario);
      const ctx = {
        docente: registro.docente,
        curso: registro.curso,
        estudiantesBase: registro.estudiantesBase,
      };
      setBase(ctx);
      const estado = await construirEstadoBimestre(
        ctx,
        bimestreActivoResolved,
        registro.bimestresCalendario,
      );
      setCuaderno(estado);
    } catch (err) {
      setError(err?.message || err);
    } finally {
      setIsRefetching(false);
    }
  }, [base, bimestreActivoResolved, construirEstadoBimestre, cursoIdResolved]);

  const materiaCurso = cuaderno?.curso?.materia ?? base?.curso?.materia ?? null;

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

  const reabiertoEfectivo = useMemo(
    () =>
      Boolean(cuaderno?.reabierto) ||
      Boolean(
        bimestresCalendario.find((b) => Number(b.numero) === bimestreActivoResolved)?.reabierto,
      ),
    [cuaderno?.reabierto, bimestresCalendario, bimestreActivoResolved],
  );

  const tienePermisoAlguna = useCallback(
    (codigo, acciones) => acciones.some((accion) => hasPermiso(codigo, accion)),
    [hasPermiso],
  );

  const vigenteEditable = useMemo(() => {
    if (bimestreActivoResolved === bimestreVigente) return true;
    if (reabiertoEfectivo) return true;
    const meta = bimestresCalendario.find(
      (b) => Number(b.numero) === bimestreActivoResolved,
    );
    return Boolean(meta?.editable);
  }, [bimestreActivoResolved, bimestreVigente, reabiertoEfectivo, bimestresCalendario]);

  const puedeOperarCuaderno = useMemo(() => {
    if (!vigenteEditable) return false;
    const permisoDocente =
      tienePermisoAlguna(CALIFICACIONES_PERMISOS.cuadernoEvaluaciones, ['CREAR', 'EDITAR']) ||
      tienePermisoAlguna(CALIFICACIONES_PERMISOS.cuadernoNotas, ['EDITAR', 'CREAR']) ||
      tienePermisoAlguna(CALIFICACIONES_PERMISOS.cuadernoGuardar, ['EDITAR', 'CREAR']);
    const permisoAdminReabierto = reabiertoEfectivo && ajusteAdmin.puedeEditar;
    return permisoDocente || permisoAdminReabierto;
  }, [vigenteEditable, reabiertoEfectivo, ajusteAdmin.puedeEditar, tienePermisoAlguna]);

  const puedeCrearEvaluacion = useMemo(
    () =>
      puedeOperarCuaderno &&
      (tienePermisoAlguna(CALIFICACIONES_PERMISOS.cuadernoEvaluaciones, ['CREAR']) ||
        (reabiertoEfectivo && ajusteAdmin.puedeEditar)),
    [puedeOperarCuaderno, reabiertoEfectivo, ajusteAdmin.puedeEditar, tienePermisoAlguna],
  );
  const puedeEditarEvaluacion = useMemo(
    () =>
      puedeOperarCuaderno &&
      tienePermisoAlguna(CALIFICACIONES_PERMISOS.cuadernoEvaluaciones, ['EDITAR', 'CREAR']),
    [puedeOperarCuaderno, tienePermisoAlguna],
  );
  const puedeEliminarEvaluacion = useMemo(
    () =>
      puedeOperarCuaderno &&
      tienePermisoAlguna(CALIFICACIONES_PERMISOS.cuadernoEvaluaciones, ['ELIMINAR']),
    [puedeOperarCuaderno, tienePermisoAlguna],
  );
  const puedeEditarNotas = useMemo(
    () =>
      puedeOperarCuaderno &&
      tienePermisoAlguna(CALIFICACIONES_PERMISOS.cuadernoNotas, ['EDITAR', 'CREAR']),
    [puedeOperarCuaderno, tienePermisoAlguna],
  );
  const puedeGuardarBimestre = useMemo(
    () =>
      puedeOperarCuaderno &&
      tienePermisoAlguna(CALIFICACIONES_PERMISOS.cuadernoGuardar, ['EDITAR', 'CREAR']),
    [puedeOperarCuaderno, tienePermisoAlguna],
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
    reabierto: reabiertoEfectivo,
    modoEdicion,
    puedeCrearEvaluacion,
    puedeEditarEvaluacion,
    puedeEliminarEvaluacion,
    puedeEditarNotas,
    puedeGuardarBimestre,
    isLoading,
    isRefetching,
    error,
    refetch,
    breadcrumbItems,
    tituloPagina,
    volverPath: cursoIdResolved ? notasCursoPath(cursoIdResolved) : MIS_CURSOS_PATH,
    cursoId: cursoIdResolved,
    esVistaCoordinacion,
    bimestresCalendario,
    crearEvaluacion,
    editarEvaluacion,
    eliminarEvaluacion,
    resetearNotasEvaluacion,
  };
};
