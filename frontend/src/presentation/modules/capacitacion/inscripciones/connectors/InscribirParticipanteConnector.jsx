/**
 * Conector: inscribir participante (CAP) — provider + página.
 * Punto de entrada lazy de la ruta CAP-INSCRIPCIONES-INSCRIBIR.
 */

import { InscribirParticipanteProvider } from '@application-capacitacion/inscripciones/providers/InscribirParticipanteProvider';
import InscribirParticipantePage from '@capacitacion/inscripciones/pages/InscribirParticipantePage';

const InscribirParticipanteConnector = () => (
  <InscribirParticipanteProvider>
    <InscribirParticipantePage />
  </InscribirParticipanteProvider>
);

export default InscribirParticipanteConnector;
