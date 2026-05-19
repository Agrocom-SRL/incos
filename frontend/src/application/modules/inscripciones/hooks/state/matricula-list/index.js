import { useMatriculaListExport } from './useMatriculaListExport';
import { useMatriculaListTable } from './useMatriculaListTable';

/**
 * Orquestador: listado de matrículas (export + tabla).
 */
export const useMatriculaListPage = () => {
  const exportState = useMatriculaListExport();
  const tableState = useMatriculaListTable();

  return {
    ...exportState,
    ...tableState,
  };
};
