/**
 * Hook: usePagosApi — listado paginado en servidor (vista_pago_aporte_listado).
 */

import { createApiHook } from '@application/utils';
import { mapPagosList } from '@application-pagos/mappers';
import { DEFAULT_LIST_LIMIT, DEFAULT_LIST_PAGE } from '@application/constants/listPagination';

export const usePagosApi = createApiHook({
  name: 'usePagosApi',
  useCase: 'obtenerTodosPagosAportes',
  dataType: 'array',
  dataKey: 'pagos',
  paginationKey: 'pagination',
  mapper: mapPagosList,
  initialLoading: false,
  autoFetch: false,
  errorMessage: 'Error al cargar los pagos',
});

export const pagosListFetchParams = (overrides = {}) => ({
  params: {
    page: DEFAULT_LIST_PAGE,
    limit: DEFAULT_LIST_LIMIT,
    ...overrides,
  },
});
