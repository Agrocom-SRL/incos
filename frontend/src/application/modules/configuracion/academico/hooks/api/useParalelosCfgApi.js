import { createApiHook, normalizeFieldToArray } from '@application/utils';
import { mapParalelosList } from '@application-academico/paralelos/mappers';

import { CATALOG_LIST_LIMIT, DEFAULT_LIST_PAGE } from '@application/constants/listPagination';

const LIST_FETCH_PARAMS = { params: { page: DEFAULT_LIST_PAGE, limit: CATALOG_LIST_LIMIT } };

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
