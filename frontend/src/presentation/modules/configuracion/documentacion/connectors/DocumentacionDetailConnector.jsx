/**
 * Conector genérico de detalle — parametrizado por `tipoKey` (ver decisión de
 * reutilización en `../routes.jsx`).
 */
import { getDocumentacionTipoConfig } from '@application-configuracion/documentacion/config/tipos';
import DocumentacionDetailPage from '@configuracion/documentacion/pages/DocumentacionDetailPage';

const DocumentacionDetailConnector = ({ tipoKey }) => {
  const tipoConfig = getDocumentacionTipoConfig(tipoKey);
  if (!tipoConfig) return null;
  return <DocumentacionDetailPage tipoConfig={tipoConfig} />;
};

export default DocumentacionDetailConnector;
