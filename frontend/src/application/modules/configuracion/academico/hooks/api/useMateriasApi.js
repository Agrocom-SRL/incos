import { createApiHook, normalizeFieldToArray } from '@application/utils';
import { mapMateriasList } from '@application-configuracion/academico/mappers';

const LIST_FETCH_PARAMS = { params: { page: 1, limit: 10000 } };

export const useMateriasApi = createApiHook({
  name: 'useMateriasApi',
  useCase: 'obtenerTodasMaterias',
  dataType: 'array',
  mapper: (data) => {
    const materiasNormalizadas = normalizeFieldToArray(data, 'materias');
    return mapMateriasList(materiasNormalizadas);
  },
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: [LIST_FETCH_PARAMS],
  dataKey: 'materias',
  errorMessage: 'Error al cargar las materias',
});
