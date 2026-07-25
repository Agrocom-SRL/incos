/**
 * Conector: programar sesión de reforzamiento (TUT) — provider + página en
 * modo create. Punto de entrada lazy de la ruta TUT-SESIONES-PROGRAMAR
 * (/tutorias/acompanamiento/sesiones/programar).
 */

import { SesionReforzamientoFormProvider } from '@application-tutorias/acompanamiento/sesiones/providers/SesionReforzamientoFormProvider';
import SesionReforzamientoFormPage from '@tutorias/acompanamiento/sesiones/pages/SesionReforzamientoFormPage';

const SesionReforzamientoFormCreateConnector = () => (
  <SesionReforzamientoFormProvider>
    <SesionReforzamientoFormPage mode="create" />
  </SesionReforzamientoFormProvider>
);

export default SesionReforzamientoFormCreateConnector;
