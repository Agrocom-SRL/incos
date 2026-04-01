/**
 * Hook: usePagosApi
 *
 * Single Responsibility: Listar pagos de aportes (vista_pago_aporte_listado); fetch inicial amplio para que la lista muestre todos los registros (búsqueda en cliente en PagosListProvider).
 *
 * Clean Architecture:
 * - Application Layer: Orquesta ObtenerTodosPagosAportesUseCase
 * - Backend: ListPagosAportesUseCase + vista_pago_aporte_listado
 *
 * Usa createApiHook (como useContributionConfigurationsApi) con paginationKey.
 * Retorna: pagos, pagination, loading, error, fetch(args), refetch(args)
 * Parámetros: refetch({ params: { page, limit, search, sort, gestion_id, estudiante_id, estado } })
 * Carga inicial con limit alto (como estudiantes/inscripciones) para listar todos y filtrar en cliente.
 * Mapea la respuesta con mapPagosList (estudiante.nombreCompleto para la UI).
 */

import { createApiHook } from '@application/utils';
import { mapPagosList } from '@application-pagos/mappers';

const DEFAULT_LIST_PARAMS = { page: 1, limit: 10000 };

export const usePagosApi = createApiHook({
  name: 'usePagosApi',
  useCase: 'obtenerTodosPagosAportes',
  dataType: 'array',
  dataKey: 'pagos',
  paginationKey: 'pagination',
  mapper: mapPagosList,
  initialLoading: true,
  autoFetch: true,
  autoFetchArgs: [{ params: DEFAULT_LIST_PARAMS }],
  errorMessage: 'Error al cargar los pagos',
});
