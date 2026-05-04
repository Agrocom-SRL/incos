import { createApiHook } from '@application/utils';

export const useParaleloCursosOfertaApi = createApiHook({
  name: 'useParaleloCursosOfertaApi',
  useCase: 'obtenerParaleloCursosOferta',
  dataType: 'object',
  initialLoading: false,
  autoFetch: false,
  dataKey: 'oferta',
  errorMessage: 'Error al cargar la oferta de cursos del paralelo',
  validate: (parallelId) => {
    if (!parallelId || (typeof parallelId !== 'string' && typeof parallelId !== 'number')) {
      return 'ID del paralelo es requerido';
    }
    return null;
  },
});
