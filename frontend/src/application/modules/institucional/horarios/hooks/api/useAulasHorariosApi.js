import { createApiHook } from '@application/utils';

export const useAulasHorariosApi = createApiHook({
  name: 'useAulasHorariosApi',
  useCase: 'obtenerAulasHorarios',
  dataType: 'array',
  dataKey: 'bloques',
  autoFetch: false,
  errorMessage: 'Error al cargar horarios de aulas',
});

