/**
 * Conector: edición de horario de capacitación (CAP) — provider (id de la URL)
 * + página en modo edit. Ruta CAP-GRUPOS-HORARIOS-EDITAR (/capacitacion/grupos/horarios/:id/editar).
 */

import { useParams } from 'react-router-dom';
import { HorarioFormProvider } from '@application-capacitacion/grupos/providers/HorarioFormProvider';
import HorarioFormPage from '@capacitacion/grupos/pages/HorarioFormPage';

const HorarioFormEditConnector = () => {
  const { id } = useParams();
  return (
    <HorarioFormProvider horarioId={id}>
      <HorarioFormPage mode="edit" />
    </HorarioFormProvider>
  );
};

export default HorarioFormEditConnector;
