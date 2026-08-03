/**
 * Conector: programar sesión de refuerzo (ACA) — provider + página en
 * modo create. Punto de entrada lazy de la ruta ACA-SESIONES-PROGRAMAR
 * (/academico/acompanamiento/sesiones/programar).
 */

import { SesionRefuerzoFormProvider } from '@application-academico/acompanamiento/sesiones/providers/SesionRefuerzoFormProvider';
import SesionRefuerzoFormPage from '@academico/acompanamiento/sesiones/pages/SesionRefuerzoFormPage';

const SesionRefuerzoFormCreateConnector = () => (
  <SesionRefuerzoFormProvider>
    <SesionRefuerzoFormPage mode="create" />
  </SesionRefuerzoFormProvider>
);

export default SesionRefuerzoFormCreateConnector;
