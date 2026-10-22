/**
 * Conector: «Editar inscripción» de capacitación (CAP) — la MISMA página y wizard del alta
 * (`InscribirParticipantePage`), montada dentro del provider de la ficha (id de la URL): ese
 * contexto es lo que pone al hook en modo edición. Ruta CAP-INSCRIPCIONES-EDITAR
 * (/capacitacion/inscripciones/:id/editar).
 */

import { useParams } from 'react-router-dom';
import { InscripcionCapacitacionDetailProvider } from '@application-capacitacion/inscripciones/providers/InscripcionCapacitacionDetailProvider';
import { InscribirParticipanteProvider } from '@application-capacitacion/inscripciones/providers/InscribirParticipanteProvider';
import InscribirParticipantePage from '@capacitacion/inscripciones/pages/InscribirParticipantePage';

const InscripcionCapEditarConnector = () => {
  const { id } = useParams();
  return (
    <InscripcionCapacitacionDetailProvider inscripcionId={id}>
      <InscribirParticipanteProvider>
        <InscribirParticipantePage />
      </InscribirParticipanteProvider>
    </InscripcionCapacitacionDetailProvider>
  );
};

export default InscripcionCapEditarConnector;
