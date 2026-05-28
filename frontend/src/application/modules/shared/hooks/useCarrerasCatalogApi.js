import { createApiHook, normalizeFieldToArray } from '@application/utils';
import { mapCarrerasList } from '@application-configuracion/academico/mappers';

const LIST_FETCH_PARAMS = { params: { page: 1, limit: 10000 } };

export const useCarrerasCatalogApi = createApiHook({
  name: 'useCarrerasCatalogApi',
  useCase: 'obtenerTodasCarreras',
  dataType: 'array',
  mapper: (data) => mapCarrerasList(normalizeFieldToArray(data, 'carreras')),
  initialLoading: true,
  autoFetch: true,
  autoFetchArgs: [LIST_FETCH_PARAMS],
  dataKey: 'carreras',
  errorMessage: 'Error al cargar el catalogo de carreras',
});
