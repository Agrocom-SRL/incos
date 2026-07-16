/**
 * Conector: listado de participantes de capacitación (CAP) — provider + página.
 * Punto de entrada lazy del ítem de menú CAP-PARTICIPANTES.
 */

import { ParticipantesListProvider } from '@application-capacitacion/participantes/providers/ParticipantesListProvider';
import ParticipantesList from '@capacitacion/participantes/pages/ParticipantesList';

const ParticipantesListConnector = () => (
  <ParticipantesListProvider>
    <ParticipantesList />
  </ParticipantesListProvider>
);

export default ParticipantesListConnector;
