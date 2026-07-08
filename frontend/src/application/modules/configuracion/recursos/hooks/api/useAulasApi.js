import { createApiHook } from '@application/utils';
import { mapAulasList } from '@application-configuracion/recursos/mappers';

/**
 * dataKey='aulas' — debe coincidir con el `dataFieldName` fijado por
 * `ListAulasController` en el backend (contrato front↔back).
 *
 * `incluirInactivos: true` SOLO en este listado de configuración (administra el
 * catálogo completo, con toggle de estado `EstadoTogglePill`). El picker de
 * Institucional/Oferta consume `AULAS_CATALOGO_ENDPOINT` y sigue viendo solo activas.
 */
export const useAulasApi = createApiHook({
  name: 'useAulasApi',
  useCase: 'obtenerTodasAulas',
  dataType: 'array',
  mapper: mapAulasList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: { params: { incluirInactivos: true } },
  dataKey: 'aulas',
  errorMessage: 'Error al cargar las aulas',
});
