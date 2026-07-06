import { useCallback, useEffect, useMemo } from 'react';
import { useTableData } from '@molecules';
import { useDocumentacionApi } from '../api/useDocumentacionApi';

/**
 * Listado de documentación filtrado por `tipoDocumento` (constante fijada por
 * la pantalla, no seleccionable por el usuario).
 *
 * @param {string} tipoDocumento - Valor del ENUM (INSCRIPCION | BECA | PASANTIA | TRASPASO)
 */
export const useDocumentacionList = (tipoDocumento) => {
  const { documentacion, loading, error, fetch } = useDocumentacionApi();

  const load = useCallback(() => {
    if (!tipoDocumento) return;
    fetch({ params: { tipoDocumento, limit: 10000 } });
  }, [fetch, tipoDocumento]);

  useEffect(() => {
    load();
  }, [load]);

  const getSearchFields = useMemo(
    () => (doc) => [doc.nombre, doc.descripcion],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(documentacion, getSearchFields);

  return {
    documentacion: filteredData,
    documentacionCompleta: documentacion,
    loading,
    error,
    refetch: load,
    searchText,
    setSearchText,
  };
};
