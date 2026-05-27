import { createApiHook } from '@application/utils';
import { normalizeFieldToArray } from '@application/utils';
import { mapMateriasList } from '@application-configuracion/academico/mappers';

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
  autoFetchArgs: {},
  dataKey: 'materias',
  errorMessage: 'Error al cargar las materias',
});
