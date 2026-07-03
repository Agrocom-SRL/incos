// modules/docentes/connectors/MiHorarioConnector.jsx
/**
 * Conector de "Mi horario" (portal del docente).
 * Sin provider propio: la página consume `useDocenteHome` directamente
 * (mismo patrón que EstudianteDashboard / DocenteDashboard).
 */

import MiHorarioPage from '@docentes/pages/MiHorarioPage';

const MiHorarioConnector = () => <MiHorarioPage />;

export default MiHorarioConnector;
