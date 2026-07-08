import { createApiHook } from '@application/utils';
import { mapActividadesList } from '@application-configuracion/actividades/mappers';

/**
 * dataKey='actividades' — fijado 1:1 con el `dataFieldName` de
 * `ListActividadesUseCase` en el backend (contrato front↔back).
 *
 * `incluirInactivos=true` SOLO en este listado de configuración (administra el
 * catálogo completo, con toggle de estado). Los selects de formularios de otros
 * módulos consumen el endpoint sin ese parámetro y siguen viendo solo activos.
 */
export const useActividadesApi = createApiHook({
  name: 'useActividadesApi',
  useCase: 'obtenerTodasActividades',
  dataType: 'array',
  mapper: mapActividadesList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: { params: { incluirInactivos: true } },
  dataKey: 'actividades',
  errorMessage: 'Error al cargar las actividades',
});
