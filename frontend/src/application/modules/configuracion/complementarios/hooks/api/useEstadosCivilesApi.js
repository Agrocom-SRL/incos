import { createApiHook } from '@application/utils';
import { mapEstadosCivilesList } from '@application-configuracion/complementarios/mappers';

/**
 * dataKey='estadosCiviles' — debe coincidir con el `dataFieldName` fijado por
 * `ListEstadosCivilesUseCase` en el backend (contrato front↔back).
 *
 * `incluirInactivos=true` SOLO en este listado de configuración (administra el
 * catálogo completo, con toggle de estado). Los selects de formularios de otros
 * módulos consumen el endpoint sin ese parámetro y siguen viendo solo activos.
 */
export const useEstadosCivilesApi = createApiHook({
  name: 'useEstadosCivilesApi',
  useCase: 'obtenerTodosEstadosCiviles',
  dataType: 'array',
  mapper: mapEstadosCivilesList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: { params: { incluirInactivos: true } },
  dataKey: 'estadosCiviles',
  errorMessage: 'Error al cargar los estados civiles',
});
