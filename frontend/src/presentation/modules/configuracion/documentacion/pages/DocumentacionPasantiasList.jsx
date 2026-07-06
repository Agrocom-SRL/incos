/**
 * Listado de documentación · Pasantías. Wrapper delgado sobre el conector
 * genérico (ver decisión de reutilización en `../routes.jsx`).
 */
import DocumentacionListConnector from '../connectors/DocumentacionListConnector';

const DocumentacionPasantiasList = () => <DocumentacionListConnector tipoKey="pasantias" />;

export default DocumentacionPasantiasList;
