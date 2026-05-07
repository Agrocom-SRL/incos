import { createApiHook } from '@application/utils';

export const useParalelosEstadoApi = createApiHook({
  name: 'useParalelosEstadoApi',
  useCase: 'obtenerParalelosEstadoDashboard',
  dataType: 'array',
  mapper: (data) => data,
  initialLoading: true,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'paralelos',
  errorMessage: 'Error al cargar estado de paralelos',
});
