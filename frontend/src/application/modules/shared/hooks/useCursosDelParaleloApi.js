import { createApiHook } from '@application/utils';

// TODO: reemplazar useCase por endpoint/caso de uso real cuando este disponible.
export const useCursosDelParaleloApi = createApiHook({
  name: 'useCursosDelParaleloApi',
  useCase: 'obtenerTodosParalelos',
  dataType: 'array',
  initialLoading: false,
  autoFetch: false,
  dataKey: 'cursos',
  errorMessage: 'Error al cargar cursos del paralelo',
});
