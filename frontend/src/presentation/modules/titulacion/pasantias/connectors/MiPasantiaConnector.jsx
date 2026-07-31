/**
 * Conector: "Mi pasantía" — portal del estudiante (TUT-MI-PASANTIA).
 *
 * Sin provider: la página consume directamente su hook de pantalla
 * (`useMiPasantiaPage`, P19 self — el backend resuelve el estudiante por
 * token). Patrón MiProyectoGradoConnector (TUT-MI-PROYECTO).
 */

import MiPasantiaPage from '@tutorias/pasantias/pages/MiPasantiaPage';

const MiPasantiaConnector = () => <MiPasantiaPage />;

export default MiPasantiaConnector;
