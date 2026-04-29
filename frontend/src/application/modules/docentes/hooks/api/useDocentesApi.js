/**
 * Carga la lista de docentes desde el API (vía caso de uso).
 */

import { createApiHook } from '@application/utils';
import { mapDocentesList } from '@application-docentes/mappers';

export const useDocentesApi = createApiHook({
  name: 'useDocentesApi',
  useCase: 'obtenerTodosDocentes',
  dataType: 'array',
  mapper: mapDocentesList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: [{ params: { page: 1, limit: 10000 } }],
  dataKey: 'docentes',
  errorMessage: 'Error al cargar los docentes',
});
