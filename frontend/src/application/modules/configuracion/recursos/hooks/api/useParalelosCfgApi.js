import { createApiHook, normalizeFieldToArray } from '@application/utils';
import { mapParalelosList } from '@application-academico/paralelos/mappers';

import { CATALOG_LIST_LIMIT, DEFAULT_LIST_PAGE } from '@application/constants/listPagination';

// `incluirInactivos=true` SOLO en este listado de configuración (administra el
// catálogo maestro completo, con toggle de estado). Los selects/pickers de otros
// módulos (`useParalelosApi`, `useParalelosCatalogApi`, inscripciones) consumen
// el endpoint sin ese parámetro y siguen viendo solo activos.
const LIST_FETCH_PARAMS = {
  params: { page: DEFAULT_LIST_PAGE, limit: CATALOG_LIST_LIMIT, incluirInactivos: true },
};

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
