/**
 * Aprobar o rechazar una licencia PENDIENTE.
 * Fetch puro: `decidirLicencia(id, { decision, observacionesDecision })`.
 * La regla "solo desde PENDIENTE" la valida el backend; el front solo muestra el error.
 */
import { createApiHook } from '@application/utils/hooks';

export const useLicenciaDecidirApi = createApiHook({
  name: 'useLicenciaDecidirApi',
  useCase: 'decidirLicencia',
  dataType: 'object',
  initialLoading: false,
  dataKey: 'licencia',
  fetchName: 'decidirLicencia',
  errorMessage: 'No se pudo registrar la decisión de la licencia',
});
