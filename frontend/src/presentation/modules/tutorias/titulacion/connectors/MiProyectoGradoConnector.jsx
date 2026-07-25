/**
 * Conector: "Mi proyecto de grado" — portal del estudiante (TUT-MI-PROYECTO).
 *
 * Sin provider: la página consume directamente su hook de pantalla
 * (`useMiProyectoGradoPage`, T4 self — el backend resuelve el estudiante por
 * token). Patrón MiBoletinConnector (ACA-MI-BOLETIN).
 */

import MiProyectoGradoPage from '@tutorias/titulacion/pages/MiProyectoGradoPage';

const MiProyectoGradoConnector = () => <MiProyectoGradoPage />;

export default MiProyectoGradoConnector;
