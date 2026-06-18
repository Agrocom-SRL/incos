/**
 * Editar una licencia PENDIENTE (motivo, detalle, rango de fechas).
 * Fetch puro: `editarLicencia(id, { fechaInicio, fechaFin, motivo, detalleMotivo })`.
 * La regla "solo PENDIENTE" y el tope de 15 días los valida el backend.
 */
import { createApiHook } from '@application/utils/hooks';

export const useLicenciaEditarApi = createApiHook({
  name: 'useLicenciaEditarApi',
  useCase: 'editarLicencia',
  dataType: 'object',
  initialLoading: false,
  dataKey: 'licencia',
  fetchName: 'editarLicencia',
  errorMessage: 'No se pudo editar la licencia',
});
