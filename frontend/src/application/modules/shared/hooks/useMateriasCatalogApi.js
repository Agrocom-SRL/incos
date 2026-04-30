import { createApiHook, normalizeFieldToArray } from '@application/utils';
import { mapMateriasList } from '@application-configuracion/academico/materias/mappers';

export const useMateriasCatalogApi = createApiHook({
  name: 'useMateriasCatalogApi',
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
  errorMessage: 'Error al cargar el catalogo de materias',
});
