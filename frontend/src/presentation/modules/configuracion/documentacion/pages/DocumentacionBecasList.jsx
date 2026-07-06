/**
 * Listado de documentación · Becas. Wrapper delgado sobre el conector genérico
 * (ver decisión de reutilización en `../routes.jsx`).
 */
import DocumentacionListConnector from '../connectors/DocumentacionListConnector';

const DocumentacionBecasList = () => <DocumentacionListConnector tipoKey="becas" />;

export default DocumentacionBecasList;
