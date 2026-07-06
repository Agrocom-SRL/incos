import { createApiHook } from '@application/utils';
import { mapActividadesList } from '@application-configuracion/actividades/mappers';

/**
 * dataKey='actividades' — fijado 1:1 con el `dataFieldName` de
 * `ListActividadesUseCase` en el backend (contrato front↔back).
 */
export const useActividadesApi = createApiHook({
  name: 'useActividadesApi',
  useCase: 'obtenerTodasActividades',
  dataType: 'array',
  mapper: mapActividadesList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'actividades',
  errorMessage: 'Error al cargar las actividades',
});
