/**
 * Conector: alta de participante de capacitación (CAP) — provider + página en modo create.
 * Punto de entrada lazy de la ruta CAP-PARTICIPANTES-NUEVO (/capacitacion/participantes/nuevo).
 */

import { ParticipanteFormProvider } from '@application-capacitacion/participantes/providers/ParticipanteFormProvider';
import ParticipanteFormPage from '@capacitacion/participantes/pages/ParticipanteFormPage';

const ParticipanteFormCreateConnector = () => (
  <ParticipanteFormProvider>
    <ParticipanteFormPage mode="create" />
  </ParticipanteFormProvider>
);

export default ParticipanteFormCreateConnector;
