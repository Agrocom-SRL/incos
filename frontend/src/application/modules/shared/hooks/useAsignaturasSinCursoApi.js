import { createApiHook } from '@application/utils';

export const useAsignaturasSinCursoApi = createApiHook({
  name: 'useAsignaturasSinCursoApi',
  useCase: 'obtenerAsignaturasSinCurso',
  dataType: 'array',
  mapper: (data) => data,
  initialLoading: true,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'asignaturas',
  errorMessage: 'Error al cargar asignaturas sin curso',
});
