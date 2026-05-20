/**
 * Cuaderno por curso — datos vía fake API, bimestre activo controlado.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { calificacionesFakeApi } from '../fake-api/index.js';
import { CALIFICACIONES_PATH } from '../utils/calificacionesPaths.js';

export const useCuadernoCurso = () => {
  const { cursoId } = useParams();
  const [cuaderno, setCuaderno] = useState(null);
  const [bimestreActivo, setBimestreActivoState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(
    async (bimestre, { conservarCuaderno = false } = {}) => {
      if (!cursoId || bimestre == null) return;
      if (conservarCuaderno) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      try {
        const data = await calificacionesFakeApi.obtenerCuaderno({
          cursoId,
          bimestre,
        });
        setCuaderno(data);
      } catch (err) {
        setError(err);
        if (!conservarCuaderno) setCuaderno(null);
      } finally {
        setIsLoading(false);
        setIsRefetching(false);
      }
    },
    [cursoId],
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError(null);
      setCuaderno(null);
      try {
        const cursosData = await calificacionesFakeApi.obtenerCalificacionesCursos();
        const bimestreVigente = cursosData.docente.bimestreVigente;
        if (cancelled) return;
        setBimestreActivoState(bimestreVigente);
        const data = await calificacionesFakeApi.obtenerCuaderno({
          cursoId,
          bimestre: bimestreVigente,
        });
        if (!cancelled) setCuaderno(data);
      } catch (err) {
        if (!cancelled) {
          setError(err);
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
  }, [cursoId]);

  const setBimestreActivo = useCallback(
    (numero) => {
      const meta = cuaderno?.bimestres?.find((b) => b.numero === numero);
      if (meta?.estado === 'bloqueado') return;
      setBimestreActivoState(numero);
      cargar(numero, { conservarCuaderno: true });
    },
    [cuaderno?.bimestres, cargar],
  );

  const refetch = useCallback(() => {
    if (bimestreActivo != null) cargar(bimestreActivo);
  }, [bimestreActivo, cargar]);

  const agregarEvaluacionLocal = useCallback((evaluacion) => {
    setCuaderno((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        evaluaciones: [...prev.evaluaciones, evaluacion],
        estudiantes: prev.estudiantes.map((est) => ({
          ...est,
          notas: { ...est.notas, [evaluacion.id]: null },
        })),
      };
    });
  }, []);

  const actualizarEvaluacionLocal = useCallback((evaluacionActualizada) => {
    setCuaderno((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        evaluaciones: prev.evaluaciones.map((e) =>
          e.id === evaluacionActualizada.id ? evaluacionActualizada : e,
        ),
      };
    });
  }, []);

  const quitarEvaluacionLocal = useCallback((evaluacionId) => {
    setCuaderno((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        evaluaciones: prev.evaluaciones.filter((e) => e.id !== evaluacionId),
        estudiantes: prev.estudiantes.map((est) => {
          const notas = { ...est.notas };
          delete notas[evaluacionId];
          return { ...est, notas };
        }),
      };
    });
  }, []);

  const crearEvaluacion = useCallback(
    async (datos) => {
      const bimestre = bimestreActivo ?? cuaderno?.bimestreActivo;
      const snapshot = cuaderno;
      const tempId = `eval-opt-${Date.now()}`;
      const optimista = {
        id: tempId,
        nombre: datos.nombre,
        tipoEvaluacionId: datos.tipoEvaluacionId,
        componente: datos.componente,
        peso: datos.peso,
        fecha: datos.fecha ?? null,
      };

      agregarEvaluacionLocal(optimista);

      try {
        const creada = await calificacionesFakeApi.crearEvaluacion({
          cursoId,
          bimestre,
          ...datos,
        });

        setCuaderno((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            evaluaciones: prev.evaluaciones.map((e) => (e.id === tempId ? creada : e)),
            estudiantes: prev.estudiantes.map((est) => {
              const notas = { ...est.notas };
              if (Object.prototype.hasOwnProperty.call(notas, tempId)) {
                delete notas[tempId];
                notas[creada.id] = null;
              }
              return { ...est, notas };
            }),
          };
        });

        return creada;
      } catch (err) {
        setCuaderno(snapshot);
        throw err;
      }
    },
    [cursoId, bimestreActivo, cuaderno, agregarEvaluacionLocal],
  );

  const editarEvaluacion = useCallback(
    async (evaluacionId, cambios) => {
      const bimestre = bimestreActivo ?? cuaderno?.bimestreActivo;
      const snapshot = cuaderno;
      const anterior = cuaderno?.evaluaciones?.find((e) => e.id === evaluacionId);

      if (anterior) {
        actualizarEvaluacionLocal({ ...anterior, ...cambios });
      }

      try {
        const actualizada = await calificacionesFakeApi.editarEvaluacion({
          cursoId,
          bimestre,
          evaluacionId,
          cambios,
        });
        actualizarEvaluacionLocal(actualizada);
        return actualizada;
      } catch (err) {
        setCuaderno(snapshot);
        throw err;
      }
    },
    [cursoId, bimestreActivo, cuaderno, actualizarEvaluacionLocal],
  );

  const eliminarEvaluacion = useCallback(
    async (evaluacionId) => {
      const bimestre = bimestreActivo ?? cuaderno?.bimestreActivo;
      const snapshot = cuaderno;

      try {
        await calificacionesFakeApi.eliminarEvaluacion({
          cursoId,
          bimestre,
          evaluacionId,
        });
        quitarEvaluacionLocal(evaluacionId);
      } catch (err) {
        setCuaderno(snapshot);
        throw err;
      }
    },
    [cursoId, bimestreActivo, cuaderno, quitarEvaluacionLocal],
  );

  const breadcrumbItems = useMemo(
    () =>
      cuaderno
        ? createBreadcrumbItems('ACA-CAL-CUADERNO', 'ACA-CAL', cuaderno.curso.materia)
        : createBreadcrumbItems('ACA-CAL-CUADERNO', 'ACA-CAL', null),
    [cuaderno?.curso.materia],
  );

  const subtituloCurso = cuaderno
    ? [
        `Paralelo ${cuaderno.curso.paralelo}`,
        cuaderno.curso.turno,
        `${cuaderno.curso.estudiantes} estudiantes`,
        `${cuaderno.curso.horasSemana} h/semana`,
      ].join(' · ')
    : '';

  return {
    curso: cuaderno?.curso ?? null,
    evaluaciones: cuaderno?.evaluaciones ?? [],
    estudiantes: cuaderno?.estudiantes ?? [],
    bimestres: cuaderno?.bimestres ?? [],
    bimestreVigente: cuaderno?.bimestreVigente ?? 2,
    bimestreActivo: bimestreActivo ?? cuaderno?.bimestreActivo ?? 2,
    modoEdicion: cuaderno?.modoEdicion ?? false,
    setBimestreActivo,
    isLoading,
    isRefetching,
    error,
    refetch,
    breadcrumbItems,
    subtituloCurso,
    volverPath: CALIFICACIONES_PATH,
    cursoId,
    crearEvaluacion,
    editarEvaluacion,
    eliminarEvaluacion,
  };
};
