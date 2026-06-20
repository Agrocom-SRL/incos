/**
 * Carga de la planilla semanal de un curso (roster × días válidos del rango).
 * Fetch puro: `fetch(asignacionId, { desde, hasta })` → { curso, rango, dias, diasValidos, registroEstado, filas }.
 * El orden de `filas` viene del backend; nunca se reordena.
 */
import { createApiHook } from '@application/utils/hooks';

export const usePlanillaAsistenciaApi = createApiHook({
  name: 'usePlanillaAsistenciaApi',
  useCase: 'obtenerPlanillaAsistenciaSemanal',
  dataType: 'object',
  initialLoading: true,
  dataKey: 'planilla',
  errorMessage: 'No se pudo cargar la planilla de asistencia',
});
