/**
 * Carga la lista de docentes desde el API (vía caso de uso).
 */

import { createApiHook } from '@application/utils';
import { mapDocentesList } from '@application-docentes/mappers';
import { DEFAULT_LIST_LIMIT, DEFAULT_LIST_PAGE } from '@application/constants/listPagination';

export const useDocentesApi = createApiHook({
  name: 'useDocentesApi',
  useCase: 'obtenerTodosDocentes',
  dataType: 'array',
  mapper: mapDocentesList,
  initialLoading: false,
  autoFetch: false,
  paginationKey: 'pagination',
  dataKey: 'docentes',
  errorMessage: 'Error al cargar los docentes',
});

export const docentesListFetchParams = (overrides = {}) => ({
  params: {
    page: DEFAULT_LIST_PAGE,
    limit: DEFAULT_LIST_LIMIT,
    incluir_estadisticas: 'false',
    ...overrides,
  },
});
