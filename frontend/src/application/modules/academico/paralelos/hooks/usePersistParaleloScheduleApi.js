import { createApiHook } from '@application/utils';

export const usePersistParaleloScheduleApi = createApiHook({
  name: 'usePersistParaleloScheduleApi',
  useCase: 'persistirParaleloHorarios',
  dataType: 'object',
  initialLoading: false,
  autoFetch: false,
  dataKey: 'result',
  errorMessage: 'Error al guardar el plan semanal del paralelo',
  validate: (parallelId, schedules) => {
    if (!parallelId || (typeof parallelId !== 'string' && typeof parallelId !== 'number')) {
      return 'ID del paralelo es requerido';
    }
    if (!Array.isArray(schedules)) {
      return 'El plan semanal (schedules) es requerido';
    }
    return null;
  },
});

