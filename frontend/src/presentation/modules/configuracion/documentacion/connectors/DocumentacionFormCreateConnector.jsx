/**
 * Conector genérico de alta — parametrizado por `tipoKey` (ver decisión de
 * reutilización en `../routes.jsx`).
 */
import { getDocumentacionTipoConfig } from '@application-configuracion/documentacion/config/tipos';
import DocumentacionFormPage from '@configuracion/documentacion/pages/DocumentacionFormPage';

const DocumentacionFormCreateConnector = ({ tipoKey }) => {
  const tipoConfig = getDocumentacionTipoConfig(tipoKey);
  if (!tipoConfig) return null;
  return <DocumentacionFormPage mode="create" tipoConfig={tipoConfig} />;
};

export default DocumentacionFormCreateConnector;
