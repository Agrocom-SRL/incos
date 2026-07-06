/**
 * Conector genérico de listado — parametrizado por `tipoKey` (evita 4 archivos
 * casi idénticos: la única diferencia entre inscripción/becas/pasantías/traslado
 * es el `tipoDocumento` constante). Ver decisión de reutilización en
 * `documentacion/routes.jsx`.
 */
import { DocumentacionProvider } from '@application-configuracion/documentacion/providers';
import { getDocumentacionTipoConfig } from '@application-configuracion/documentacion/config/tipos';
import DocumentacionListPage from '@configuracion/documentacion/pages/DocumentacionListPage';

const DocumentacionListConnector = ({ tipoKey }) => {
  const tipoConfig = getDocumentacionTipoConfig(tipoKey);
  if (!tipoConfig) return null;
  return (
    <DocumentacionProvider tipoDocumento={tipoConfig.tipoDocumento}>
      <DocumentacionListPage tipoConfig={tipoConfig} />
    </DocumentacionProvider>
  );
};

export default DocumentacionListConnector;
