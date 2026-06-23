/**
 * Cancelar una licencia (estado → CANCELADA).
 * Fetch puro: `cancelarLicencia(id)`. La regla "solo PENDIENTE o APROBADA" la valida el backend.
 */
import { createApiHook } from '@application/utils/hooks';

export const useLicenciaCancelarApi = createApiHook({
  name: 'useLicenciaCancelarApi',
  useCase: 'cancelarLicencia',
  dataType: 'object',
  initialLoading: false,
  dataKey: 'licencia',
  fetchName: 'cancelarLicencia',
  errorMessage: 'No se pudo cancelar la licencia',
});
