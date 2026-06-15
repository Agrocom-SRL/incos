import { createApiHook, normalizeFieldToArray } from '@application/utils';
import { mapCarrerasList } from '@application-configuracion/academico/mappers';

import { CATALOG_LIST_LIMIT, DEFAULT_LIST_PAGE } from '@application/constants/listPagination';

const LIST_FETCH_PARAMS = { params: { page: DEFAULT_LIST_PAGE, limit: CATALOG_LIST_LIMIT } };

export const useCarrerasApi = createApiHook({
  name: 'useCarrerasApi',
  useCase: 'obtenerTodasCarreras',
  dataType: 'array',
  mapper: (data) => mapCarrerasList(normalizeFieldToArray(data, 'carreras')),
  initialLoading: true,
  autoFetch: true,
  autoFetchArgs: [LIST_FETCH_PARAMS],
  dataKey: 'carreras',
  errorMessage: 'Error al cargar las carreras',
});
