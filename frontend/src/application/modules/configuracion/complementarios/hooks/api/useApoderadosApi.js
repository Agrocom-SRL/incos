import { createApiHook } from '@application/utils';
import { mapApoderadosList } from '@application-configuracion/complementarios/mappers';

/**
 * dataKey='tiposParentesco' — debe coincidir con el `dataFieldName` fijado por
 * `ListTiposParentescoUseCase` en el backend (contrato front↔back).
 */
export const useApoderadosApi = createApiHook({
  name: 'useApoderadosApi',
  useCase: 'obtenerTodosTiposParentesco',
  dataType: 'array',
  mapper: mapApoderadosList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'tiposParentesco',
  errorMessage: 'Error al cargar los apoderados (tipos de parentesco)',
});
