import { useDocumentacionList } from '../hooks/features/useDocumentacionList';
import { DocumentacionContext } from '../context/DocumentacionContext';

/**
 * Provider delgado del listado unificado de documentación (todos los tipos).
 * Ensambla el hook de lista; no contiene lógica de negocio.
 */
export const DocumentacionProvider = ({ children }) => {
  const listData = useDocumentacionList();
  return (
    <DocumentacionContext.Provider value={listData}>{children}</DocumentacionContext.Provider>
  );
};
