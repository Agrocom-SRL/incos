/**
 * Solicitar una licencia estudiantil (nace PENDIENTE en el backend).
 * Fetch puro: `fetch({ inscripcionId, fechaInicio, fechaFin, motivo, detalleMotivo })`.
 * El tope de 15 días/gestión lo valida el backend; el front solo muestra el error.
 */
import { createApiHook } from '@application/utils/hooks';

export const useLicenciaCrearApi = createApiHook({
  name: 'useLicenciaCrearApi',
  useCase: 'crearLicencia',
  dataType: 'object',
  initialLoading: false,
  dataKey: 'licencia',
  fetchName: 'crearLicencia',
  errorMessage: 'No se pudo solicitar la licencia',
});
