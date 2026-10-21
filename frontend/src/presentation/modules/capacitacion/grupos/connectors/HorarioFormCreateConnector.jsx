/**
 * Conector: alta de horario de capacitación (CAP) — provider + página en modo create.
 * Punto de entrada lazy de la ruta CAP-GRUPOS-HORARIOS-NUEVO (/capacitacion/grupos/horarios/nuevo).
 */

import { HorarioFormProvider } from '@application-capacitacion/grupos/providers/HorarioFormProvider';
import HorarioFormPage from '@capacitacion/grupos/pages/HorarioFormPage';

const HorarioFormCreateConnector = () => (
  <HorarioFormProvider>
    <HorarioFormPage mode="create" />
  </HorarioFormProvider>
);

export default HorarioFormCreateConnector;
