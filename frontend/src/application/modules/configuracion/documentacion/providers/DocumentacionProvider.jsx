import { useDocumentacionList } from '../hooks/features/useDocumentacionList';
import { DocumentacionContext } from '../context/DocumentacionContext';

/**
 * Provider delgado, parametrizado por `tipoDocumento` (una instancia por
 * pantalla: inscripción/becas/pasantías/traslado). Ensambla el hook de lista
 * ya filtrado; no contiene lógica de negocio.
 */
export const DocumentacionProvider = ({ tipoDocumento, children }) => {
  const listData = useDocumentacionList(tipoDocumento);
  return (
    <DocumentacionContext.Provider value={listData}>{children}</DocumentacionContext.Provider>
  );
};
