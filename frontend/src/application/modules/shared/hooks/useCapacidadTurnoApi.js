import { createApiHook } from '@application/utils';

export const useCapacidadTurnoApi = createApiHook({
  name: 'useCapacidadTurnoApi',
  useCase: 'obtenerCapacidadTurno',
  dataType: 'array',
  mapper: (data) => data,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'capacidad',
  errorMessage: 'Error al cargar capacidad por turno',
});
