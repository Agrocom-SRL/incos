/**
 * Carga el detalle de un folio (nómina + celdas de nota final por materia).
 * GET /v1/libros/:id/folios/:folioId
 */

import { createApiHook } from '@application/utils';
import { mapFolio } from '@application-academico/libros/mappers';

export const useFolioDetalleApi = createApiHook({
  name: 'useFolioDetalleApi',
  useCase: 'obtenerFolioPorId',
  dataType: 'object',
  mapper: mapFolio,
  initialLoading: true,
  autoFetch: false,
  dataKey: 'folio',
  errorMessage: 'Error al cargar el folio',
});

export default useFolioDetalleApi;
