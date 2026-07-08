import { useMemo } from 'react';
import { useDocumentacionApi } from '../api/useDocumentacionApi';
import { useToggleEstadoCatalogo } from '@application-shared/hooks';
import { useTableData } from '@molecules';
import { getTipoDocumentoLabel } from '@application-configuracion/documentacion/config/tipos';

/**
 * Listado unificado de documentación (los 9 tipos del ENUM en una sola tabla;
 * la búsqueda cubre también el label humano del tipo).
 */
export const useDocumentacionList = () => {
  const { documentacion, loading, error, refetch } = useDocumentacionApi();

  const getSearchFields = useMemo(
    () => (doc) => [doc.nombre, doc.descripcion, getTipoDocumentoLabel(doc.tipoDocumento)],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(documentacion, getSearchFields);

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoDocumentacion',
    entidad: 'el documento',
    refetch,
  });

  return {
    documentacion: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    toggleEstado,
  };
};
