import { createApiHook } from '@application/utils';
import { mapCarrerasList } from '@application-configuracion/academico/mappers';

export const useCarrerasApi = createApiHook({
  name: 'useCarrerasApi',
  useCase: 'obtenerTodasCarreras',
  dataType: 'array',
  mapper: mapCarrerasList,
  initialLoading: true,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'carreras',
  errorMessage: 'Error al cargar las carreras',
});
