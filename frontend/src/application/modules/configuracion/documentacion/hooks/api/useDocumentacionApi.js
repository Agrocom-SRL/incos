import { createApiHook } from '@application/utils';
import { mapDocumentacionList } from '@application-configuracion/documentacion/mappers';

/**
 * dataKey='documentacion' — debe coincidir con el `dataFieldName` fijado por
 * `ListDocumentacionUseCase` en el backend (contrato front↔back).
 *
 * `incluirInactivos=true` SOLO en este listado de configuración (administra el
 * catálogo completo de los 9 tipos, con toggle de estado). Los combos de otros
 * módulos consumen el endpoint sin ese parámetro y siguen viendo solo activos.
 */
export const useDocumentacionApi = createApiHook({
  name: 'useDocumentacionApi',
  useCase: 'obtenerTodaDocumentacion',
  dataType: 'array',
  mapper: mapDocumentacionList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: { params: { incluirInactivos: true, limit: 10000 } },
  dataKey: 'documentacion',
  errorMessage: 'Error al cargar la documentación',
});
