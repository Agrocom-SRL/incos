import { createApiHook, normalizeFieldToArray } from '@application/utils';
import { mapMateriasList } from '@application-configuracion/academico/mappers';

import { CATALOG_LIST_LIMIT, DEFAULT_LIST_PAGE } from '@application/constants/listPagination';

const LIST_FETCH_PARAMS = { params: { page: DEFAULT_LIST_PAGE, limit: CATALOG_LIST_LIMIT } };

export const useMateriasApi = createApiHook({
  name: 'useMateriasApi',
  useCase: 'obtenerTodasMaterias',
  dataType: 'array',
  mapper: (data) => {
    const materiasNormalizadas = normalizeFieldToArray(data, 'materias');
    return mapMateriasList(materiasNormalizadas);
  },
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: [LIST_FETCH_PARAMS],
  dataKey: 'materias',
  errorMessage: 'Error al cargar las materias',
});
