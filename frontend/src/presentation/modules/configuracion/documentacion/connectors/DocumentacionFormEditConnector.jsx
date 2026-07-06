/**
 * Conector genérico de edición — parametrizado por `tipoKey` (ver decisión de
 * reutilización en `../routes.jsx`).
 */
import { getDocumentacionTipoConfig } from '@application-configuracion/documentacion/config/tipos';
import DocumentacionFormPage from '@configuracion/documentacion/pages/DocumentacionFormPage';

const DocumentacionFormEditConnector = ({ tipoKey }) => {
  const tipoConfig = getDocumentacionTipoConfig(tipoKey);
  if (!tipoConfig) return null;
  return <DocumentacionFormPage mode="edit" tipoConfig={tipoConfig} />;
};

export default DocumentacionFormEditConnector;
