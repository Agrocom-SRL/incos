/**
 * Listado de documentación · Traslado. Wrapper delgado sobre el conector
 * genérico (ver decisión de reutilización en `../routes.jsx`).
 */
import DocumentacionListConnector from '../connectors/DocumentacionListConnector';

const DocumentacionTrasladoList = () => <DocumentacionListConnector tipoKey="traslado" />;

export default DocumentacionTrasladoList;
