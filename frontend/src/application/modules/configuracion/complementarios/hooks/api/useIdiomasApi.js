import { createApiHook } from '@application/utils';
import { mapIdiomasList } from '@application-configuracion/complementarios/mappers';

/**
 * dataKey='idiomas' — debe coincidir con el `dataFieldName` fijado por
 * `ListIdiomasUseCase` en el backend (contrato front↔back).
 *
 * `incluirInactivos=true` SOLO en este listado de configuración (administra el
 * catálogo completo, con toggle de estado). Los selects de formularios de otros
 * módulos consumen el endpoint sin ese parámetro y siguen viendo solo activos.
 */
export const useIdiomasApi = createApiHook({
  name: 'useIdiomasApi',
  useCase: 'obtenerTodosIdiomas',
  dataType: 'array',
  mapper: mapIdiomasList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: { params: { incluirInactivos: true } },
  dataKey: 'idiomas',
  errorMessage: 'Error al cargar los idiomas',
});
