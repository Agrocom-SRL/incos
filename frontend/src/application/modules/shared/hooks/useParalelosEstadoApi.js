import { createApiHook } from '@application/utils';

function normalizeParalelosEstadoDashboardPayload(data) {
  if (data && Array.isArray(data.paralelos)) {
    return {
      paralelos: data.paralelos,
      kpis: data.kpis ?? null,
    };
  }
  if (Array.isArray(data)) {
    return { paralelos: data, kpis: null };
  }
  return { paralelos: [], kpis: null };
}

export const useParalelosEstadoApi = createApiHook({
  name: 'useParalelosEstadoApi',
  useCase: 'obtenerParalelosEstadoDashboard',
  dataType: 'object',
  mapper: normalizeParalelosEstadoDashboardPayload,
  initialLoading: true,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'paralelosEstadoDashboard',
  errorMessage: 'Error al cargar estado de paralelos',
});
