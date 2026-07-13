import { createApiHook, normalizeFieldToArray } from '@application/utils';
import { mapCarrerasList } from '@application-configuracion/academico/mappers';

import { CATALOG_LIST_LIMIT, DEFAULT_LIST_PAGE } from '@application/constants/listPagination';

const LIST_FETCH_PARAMS = { params: { page: DEFAULT_LIST_PAGE, limit: CATALOG_LIST_LIMIT } };

/**
 * @param {Object} [options]
 * @param {boolean} [options.autoFetch=true] - Si debe cargar al montar. En `false`
 *   evita el fetch (ej. tab de un menú sin ese permiso, que ni siquiera se renderiza).
 */
export const useCarrerasApi = (options = {}) => {
  const { autoFetch = true } = options;

  return createApiHook({
    name: 'useCarrerasApi',
    useCase: 'obtenerTodasCarreras',
    dataType: 'array',
    mapper: (data) => mapCarrerasList(normalizeFieldToArray(data, 'carreras')),
    initialLoading: true,
    autoFetch,
    autoFetchArgs: [LIST_FETCH_PARAMS],
    dataKey: 'carreras',
    errorMessage: 'Error al cargar las carreras',
  })();
};
