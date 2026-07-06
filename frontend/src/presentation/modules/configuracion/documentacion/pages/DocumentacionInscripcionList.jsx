/**
 * Listado de documentación · Inscripción. Wrapper delgado sobre el conector
 * genérico (ver decisión de reutilización en `../routes.jsx`).
 */
import DocumentacionListConnector from '../connectors/DocumentacionListConnector';

const DocumentacionInscripcionList = () => <DocumentacionListConnector tipoKey="inscripcion" />;

export default DocumentacionInscripcionList;
