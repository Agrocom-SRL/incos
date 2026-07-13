import GestionFormPage from '../pages/GestionFormPage';

/** mode: 'create' (gestiones/nueva) | 'edit' (gestiones/:gestionId/editar). */
const GestionFormConnector = ({ mode = 'create' }) => <GestionFormPage mode={mode} />;

export default GestionFormConnector;
