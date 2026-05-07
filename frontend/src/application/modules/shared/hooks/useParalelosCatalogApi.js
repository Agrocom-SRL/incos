import { createApiHook, normalizeFieldToArray } from '@application/utils';
import { mapParalelosList } from '@application-academico/paralelos/mappers';

export const useParalelosCatalogApi = createApiHook({
  name: 'useParalelosCatalogApi',
  useCase: 'obtenerTodosParalelos',
  dataType: 'array',
  mapper: (data) => {
    const paralelosNormalizados = normalizeFieldToArray(data, 'paralelos');
    return mapParalelosList(paralelosNormalizados);
  },
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: [{ params: { limit: 100 } }],
  dataKey: 'paralelos',
  errorMessage: 'Error al cargar el catalogo de paralelos',
});
