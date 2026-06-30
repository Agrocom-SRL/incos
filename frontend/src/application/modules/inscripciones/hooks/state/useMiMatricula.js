/**
 * useMiMatricula — datos de "Mi matrícula" del estudiante autenticado (solo lectura).
 *
 * Consume GET /v1/estudiantes/mi-matricula y prepara los datos para la grilla
 * semanal reutilizable (DocenteHorarioSemanalGrid), igual que la pestaña de
 * horarios de inscripción. No descarga nada.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import EstudianteRepository from '@infrastructure/repositories/EstudianteRepository.js';
import { grillaHorarioToCourseSchedules } from '@application-institucional/horarios/mappers/grillaHorarioMapper.js';
import {
  getTurnoGridRangeMinutes,
  getSabadoArmadoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange.js';

export const useMiMatricula = (enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await EstudianteRepository.obtenerMiMatricula();
      if (!result?.success) {
        setData(null);
        setError(result?.error || 'No se pudo cargar tu matrícula');
        return;
      }
      setData(result.data ?? null);
    } catch (err) {
      setData(null);
      setError(err?.message || 'No se pudo cargar tu matrícula');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const courseSchedules = useMemo(
    () => (data?.horario ? grillaHorarioToCourseSchedules(data.horario) : []),
    [data?.horario],
  );

  const gridRangeInscripcion = useMemo(
    () => getTurnoGridRangeMinutes(data?.horario?.turno ?? null),
    [data?.horario?.turno],
  );

  const sabadoRangeInscripcion = useMemo(() => getSabadoArmadoGridRangeMinutes(), []);

  return {
    estudiante: data?.estudiante ?? null,
    gestion: data?.gestion ?? null,
    carrera: data?.carrera ?? null,
    materias: data?.materias ?? [],
    courseSchedules,
    gridRangeInscripcion,
    sabadoRangeInscripcion,
    loading,
    error,
    refetch: cargar,
  };
};

export default useMiMatricula;
