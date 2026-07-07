import { createApiHook } from '@application/utils';
import { mapAulasList } from '@application-configuracion/recursos/mappers';

/**
 * dataKey='aulas' — debe coincidir con el `dataFieldName` fijado por
 * `ListAulasController` en el backend (contrato front↔back).
 *
 * `incluirInactivos: true` para que el aula desactivada a propósito
 * (LAB-2 / Sala de Docentes) se vea en el listado admin con `StatusPill` inactivo.
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
