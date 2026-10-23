/**
 * Conector: ficha de participante de capacitación (CAP) — provider (id de la URL) + página.
 * Punto de entrada lazy de la ruta CAP-PARTICIPANTES-DETALLE (/capacitacion/participantes/:id).
 */

import { useParams } from 'react-router-dom';
import { ParticipanteDetailProvider } from '@application-capacitacion/participantes/providers/ParticipanteDetailProvider';
import ParticipanteDetail from '@capacitacion/participantes/pages/ParticipanteDetail';

const ParticipanteDetailConnector = () => {
  const { id } = useParams();
  return (
    <ParticipanteDetailProvider participanteId={id}>
      <ParticipanteDetail />
    </ParticipanteDetailProvider>
  );
};

export default ParticipanteDetailConnector;
