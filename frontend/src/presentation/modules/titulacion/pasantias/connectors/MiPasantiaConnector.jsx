/**
 * Conector: "Mi pasantía" — portal del estudiante (TIT-MI-PASANTIA).
 *
 * Sin provider: la página consume directamente su hook de pantalla
 * (`useMiPasantiaPage`, P19 self — el backend resuelve el estudiante por
 * token). Patrón MiProyectoGradoConnector (TIT-MI-PROYECTO).
 */

import MiPasantiaPage from '@titulacion/pasantias/pages/MiPasantiaPage';

const MiPasantiaConnector = () => <MiPasantiaPage />;

export default MiPasantiaConnector;
