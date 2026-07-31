/**
 * Conector: programar sesión de refuerzo (TUT) — provider + página en
 * modo create. Punto de entrada lazy de la ruta TUT-SESIONES-PROGRAMAR
 * (/tutorias/acompanamiento/sesiones/programar).
 */

import { SesionRefuerzoFormProvider } from '@application-tutorias/acompanamiento/sesiones/providers/SesionRefuerzoFormProvider';
import SesionRefuerzoFormPage from '@tutorias/acompanamiento/sesiones/pages/SesionRefuerzoFormPage';

const SesionRefuerzoFormCreateConnector = () => (
  <SesionRefuerzoFormProvider>
    <SesionRefuerzoFormPage mode="create" />
  </SesionRefuerzoFormProvider>
);

export default SesionRefuerzoFormCreateConnector;
