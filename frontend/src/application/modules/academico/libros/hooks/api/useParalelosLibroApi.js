/**
 * Carga los paralelos candidatos del generador de folios de un libro.
 * GET /v1/libros/:id/paralelos
 */

import { createApiHook } from '@application/utils';
import { mapParalelosLibro } from '@application-academico/libros/mappers';

export const useParalelosLibroApi = createApiHook({
  name: 'useParalelosLibroApi',
  useCase: 'listarParalelosLibro',
  dataType: 'array',
  mapper: mapParalelosLibro,
  initialLoading: false,
  autoFetch: false,
  dataKey: 'paralelos',
  errorMessage: 'Error al cargar los paralelos del libro',
});

export default useParalelosLibroApi;
