import { createApiHook } from '@application/utils';

export const usePatchAulaHorarioApi = createApiHook({
  name: 'usePatchAulaHorarioApi',
  useCase: 'asignarAulaHorario',
  dataType: 'object',
  dataKey: 'result',
  autoFetch: false,
  errorMessage: 'Error al asignar aula',
});

