/**
 * Carga del calendario mensual del bimestre activo de un curso (toma de asistencia).
 * Fetch puro: `fetch(asignacionId, { bimestre })` → { curso, bimestre, rango, registroEstado, dias }.
 */
import { createApiHook } from '@application/utils/hooks';

export const useCalendarioAsistenciaApi = createApiHook({
  name: 'useCalendarioAsistenciaApi',
  useCase: 'obtenerCalendarioAsistencia',
  dataType: 'object',
  initialLoading: true,
  dataKey: 'calendario',
  errorMessage: 'No se pudo cargar el calendario de asistencia',
});
