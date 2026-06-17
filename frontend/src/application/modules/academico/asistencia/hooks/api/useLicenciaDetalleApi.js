/**
 * Detalle de una licencia estudiantil.
 * Fetch puro: `fetch(id)`. El backend responde `{ data: { licencia } }`; el mapper
 * desenvuelve la clave `licencia` para exponer el objeto de licencia directamente
 * (createApiHook no desenvuelve `dataKey`, solo nombra la propiedad expuesta).
 */
import { createApiHook } from '@application/utils/hooks';

export const useLicenciaDetalleApi = createApiHook({
  name: 'useLicenciaDetalleApi',
  useCase: 'obtenerLicenciaPorId',
  dataType: 'object',
  initialLoading: true,
  dataKey: 'licencia',
  mapper: (data) => data?.licencia ?? null,
  errorMessage: 'No se pudo cargar la licencia',
});
