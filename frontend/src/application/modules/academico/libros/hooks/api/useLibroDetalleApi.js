/**
 * Carga la ficha de un libro de registro (cabecera + folios) desde el API.
 * GET /v1/libros/:id
 */

import { createApiHook } from '@application/utils';
import { mapLibro } from '@application-academico/libros/mappers';

export const useLibroDetalleApi = createApiHook({
  name: 'useLibroDetalleApi',
  useCase: 'obtenerLibroPorId',
  dataType: 'object',
  mapper: mapLibro,
  initialLoading: true,
  autoFetch: false,
  dataKey: 'libro',
  errorMessage: 'Error al cargar el libro de registro',
});

export default useLibroDetalleApi;
