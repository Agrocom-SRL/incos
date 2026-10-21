/**
 * Hook de API: catálogo de horarios de capacitación para el formulario de curso.
 *
 * - `GET /cursos-capacitacion/horarios`: catálogo `tipo_horario='CAPACITACION'`
 *   (sin aula: el aula es opcional y no condiciona el selector).
 * - `POST /cursos-capacitacion/horarios`: find-or-create `{dia, horaInicio,
 *   horaFin, nombre?}` desde el modal «Crear horario»; en éxito el horario
 *   queda en el catálogo local (sin duplicar si ya existía) y se devuelve para
 *   que el selector lo deje seleccionado.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import horarioCapacitacionRepository from '@implementations/HorarioCapacitacionRepository';
import {
  mapFormValuesToHorarioPayload,
  mapHorarioCapacitacion,
  mapHorariosCapacitacionList,
} from '@application-capacitacion/grupos/mappers/horarioCapacitacionMapper';
import { compararHorarios } from '@application-capacitacion/utils/horarioCapacitacion';

export const useHorariosCapacitacionApi = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await horarioCapacitacionRepository.obtenerTodos();
    if (!result?.success) {
      const msg = result?.error || 'No se pudieron cargar los horarios de capacitación';
      setHorarios([]);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapHorariosCapacitacionList(result.data);
    setHorarios(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crearHorario = useCallback(async (values) => {
    setCreando(true);
    try {
      const result = await horarioCapacitacionRepository.crear(
        mapFormValuesToHorarioPayload(values),
      );
      if (!result?.success) {
        return { success: false, error: result?.error || 'No se pudo crear el horario' };
      }
      const creado = mapHorarioCapacitacion(result.data?.horario ?? result.data);
      if (!creado) {
        return { success: false, error: 'La respuesta del servidor no incluye el horario creado' };
      }
      setHorarios((prev) =>
        [...prev.filter((h) => h.horarioId !== creado.horarioId), creado].sort(compararHorarios),
      );
      return { success: true, data: creado };
    } finally {
      setCreando(false);
    }
  }, []);

  return useMemo(
    () => ({ horarios, loading, error, creando, cargar, crearHorario }),
    [horarios, loading, error, creando, cargar, crearHorario],
  );
};
