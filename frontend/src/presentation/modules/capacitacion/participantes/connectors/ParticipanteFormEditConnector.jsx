/**
 * Conector: edición de participante de capacitación (CAP) — provider (id de la
 * URL) + página en modo edit. Ruta CAP-PARTICIPANTES-EDITAR
 * (/capacitacion/participantes/:id/editar).
 */

import { useParams } from 'react-router-dom';
import { ParticipanteFormProvider } from '@application-capacitacion/participantes/providers/ParticipanteFormProvider';
import ParticipanteFormPage from '@capacitacion/participantes/pages/ParticipanteFormPage';

const ParticipanteFormEditConnector = () => {
  const { id } = useParams();
  return (
    <ParticipanteFormProvider participanteId={id}>
      <ParticipanteFormPage mode="edit" />
    </ParticipanteFormProvider>
  );
};

export default ParticipanteFormEditConnector;
