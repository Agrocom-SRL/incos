/**
 * Listado de licencias estudiantiles (filtro opcional por estado).
 * El backend responde `{ data: { licencias: [...] } }`; el mapper desenvuelve la clave
 * `licencias` para exponer el array directamente (createApiHook no desenvuelve `dataKey`,
 * solo nombra la propiedad expuesta — igual que useLicenciaDetalleApi).
 */
import { createApiHook } from '@application/utils/hooks';

export const useLicenciasListApi = createApiHook({
  name: 'useLicenciasListApi',
  useCase: 'listarLicencias',
  dataType: 'array',
  initialLoading: true,
  dataKey: 'licencias',
  mapper: (data) => (Array.isArray(data) ? data : data?.licencias ?? []),
  errorMessage: 'No se pudieron cargar las licencias',
});
