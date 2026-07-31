/**
 * Carga el listado de libros de registro desde el API (vía caso de uso).
 * GET /v1/libros?carreraId&gestionId
 */

import { createApiHook } from '@application/utils';
import { mapLibrosList } from '@application-academico/libros/mappers';

export const useLibrosApi = createApiHook({
  name: 'useLibrosApi',
  useCase: 'listarLibros',
  dataType: 'array',
  mapper: mapLibrosList,
  initialLoading: true,
  autoFetch: true,
  autoFetchArgs: [{}],
  dataKey: 'libros',
  errorMessage: 'Error al cargar los libros de registro',
});

export default useLibrosApi;
