/**
 * Listado de licencias estudiantiles (filtro opcional por estado).
 * Fetch puro: `fetch({ estado })` → { licencias: [...] } (dataKey `licencias`).
 */
import { createApiHook } from '@application/utils/hooks';

export const useLicenciasListApi = createApiHook({
  name: 'useLicenciasListApi',
  useCase: 'listarLicencias',
  dataType: 'array',
  initialLoading: true,
  dataKey: 'licencias',
  errorMessage: 'No se pudieron cargar las licencias',
});
