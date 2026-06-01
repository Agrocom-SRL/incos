import { createApiHook, normalizeFieldToArray } from '@application/utils';
import { mapParalelosList } from '@application-academico/paralelos/mappers';

const LIST_FETCH_PARAMS = { params: { page: 1, limit: 10000 } };

export const useParalelosCfgApi = createApiHook({
  name: 'useParalelosCfgApi',
  useCase: 'obtenerTodosParalelos',
  dataType: 'array',
  mapper: (data) => mapParalelosList(normalizeFieldToArray(data, 'paralelos')),
  initialLoading: true,
  autoFetch: true,
  autoFetchArgs: [LIST_FETCH_PARAMS],
  dataKey: 'paralelos',
  errorMessage: 'Error al cargar los paralelos',
});
