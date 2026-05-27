import { createApiHook } from '@application/utils';
import { mapDiscapacidadesList } from '@application-configuracion/complementarios/mappers';

export const useDiscapacidadesApi = createApiHook({
  name: 'useDiscapacidadesApi',
  useCase: 'obtenerTodasDiscapacidades',
  dataType: 'array',
  mapper: mapDiscapacidadesList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'discapacidades',
  errorMessage: 'Error al cargar las discapacidades',
});
