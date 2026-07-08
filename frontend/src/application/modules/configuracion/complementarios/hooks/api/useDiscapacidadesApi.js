import { createApiHook } from '@application/utils';
import { mapDiscapacidadesList } from '@application-configuracion/complementarios/mappers';

/**
 * `incluirInactivos=true` SOLO en este listado de configuración (administra el
 * catálogo completo, con toggle de estado). Los selects de formularios de otros
 * módulos consumen el endpoint sin ese parámetro y siguen viendo solo activos.
 */
export const useDiscapacidadesApi = createApiHook({
  name: 'useDiscapacidadesApi',
  useCase: 'obtenerTodasDiscapacidades',
  dataType: 'array',
  mapper: mapDiscapacidadesList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: { params: { incluirInactivos: true } },
  dataKey: 'discapacidades',
  errorMessage: 'Error al cargar las discapacidades',
});
