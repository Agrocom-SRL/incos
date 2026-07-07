import { createApiHook } from '@application/utils';
import { mapEstadosCivilesList } from '@application-configuracion/complementarios/mappers';

/**
 * dataKey='estadosCiviles' — debe coincidir con el `dataFieldName` fijado por
 * `ListEstadosCivilesUseCase` en el backend (contrato front↔back).
 */
export const useEstadosCivilesApi = createApiHook({
  name: 'useEstadosCivilesApi',
  useCase: 'obtenerTodosEstadosCiviles',
  dataType: 'array',
  mapper: mapEstadosCivilesList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'estadosCiviles',
  errorMessage: 'Error al cargar los estados civiles',
});
