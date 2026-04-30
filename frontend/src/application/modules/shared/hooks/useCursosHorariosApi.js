import { createApiHook } from '@application/utils';

// TODO: reemplazar useCase por endpoint/caso de uso real cuando este disponible.
export const useCursosHorariosApi = createApiHook({
  name: 'useCursosHorariosApi',
  useCase: 'obtenerTodosParalelos',
  dataType: 'array',
  initialLoading: false,
  autoFetch: false,
  dataKey: 'cursosHorarios',
  errorMessage: 'Error al cargar cursos horarios',
});
