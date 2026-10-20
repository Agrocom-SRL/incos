import { useMatriculaListExport } from './useMatriculaListExport';
import { useMatriculaListTable } from './useMatriculaListTable';

export { useMatriculaListFilters } from './useMatriculaListFilters';

/**
 * Orquestador: listado de matrículas (export + tabla + filtros).
 */
export const useMatriculaListPage = () => {
  const exportState = useMatriculaListExport();
  const tableState = useMatriculaListTable();

  return {
    ...exportState,
    ...tableState,
  };
};
