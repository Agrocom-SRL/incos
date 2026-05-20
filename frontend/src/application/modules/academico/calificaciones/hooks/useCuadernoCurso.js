/**
 * Cuaderno por curso — datos vía fake API, bimestre activo controlado.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { calificacionesFakeApi } from '../fake-api/index.js';
import { MIS_CURSOS_PATH } from '../utils/calificacionesPaths.js';

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
        const cursosData = await calificacionesFakeApi.obtenerMisCursos();
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
    volverPath: MIS_CURSOS_PATH,
    cursoId,
  };
};
