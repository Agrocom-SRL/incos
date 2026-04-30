import { createApiHook } from '@application/utils';
import { mapCarrerasList } from '@application-configuracion/academico/carreras/mappers';

export const useCarrerasCatalogApi = createApiHook({
  name: 'useCarrerasCatalogApi',
  useCase: 'obtenerTodasCarreras',
  dataType: 'array',
  mapper: mapCarrerasList,
  initialLoading: true,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'carreras',
  errorMessage: 'Error al cargar el catalogo de carreras',
});
