import { createApiHook } from '@application/utils';
import { mapApoderadosList } from '@application-configuracion/complementarios/mappers';

/**
 * dataKey='tiposParentesco' — debe coincidir con el `dataFieldName` fijado por
 * `ListTiposParentescoUseCase` en el backend (contrato front↔back).
 *
 * `incluirInactivos=true` SOLO en este listado de configuración (administra el
 * catálogo completo, con toggle de estado). Los selects de formularios de otros
 * módulos consumen el endpoint sin ese parámetro y siguen viendo solo activos.
 */
export const useApoderadosApi = createApiHook({
  name: 'useApoderadosApi',
  useCase: 'obtenerTodosTiposParentesco',
  dataType: 'array',
  mapper: mapApoderadosList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: { params: { incluirInactivos: true } },
  dataKey: 'tiposParentesco',
  errorMessage: 'Error al cargar los apoderados (tipos de parentesco)',
});
