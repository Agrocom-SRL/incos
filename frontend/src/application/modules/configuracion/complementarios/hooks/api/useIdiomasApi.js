import { createApiHook } from '@application/utils';
import { mapIdiomasList } from '@application-configuracion/complementarios/mappers';

/**
 * dataKey='idiomas' — debe coincidir con el `dataFieldName` fijado por
 * `ListIdiomasUseCase` en el backend (contrato front↔back).
 */
export const useIdiomasApi = createApiHook({
  name: 'useIdiomasApi',
  useCase: 'obtenerTodosIdiomas',
  dataType: 'array',
  mapper: mapIdiomasList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'idiomas',
  errorMessage: 'Error al cargar los idiomas',
});
