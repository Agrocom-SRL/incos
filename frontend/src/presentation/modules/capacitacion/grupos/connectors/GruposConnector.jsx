/**
 * Conector: menú «Grupos» de Capacitación — providers de los dos tabs
 * (horarios y grupos) + página con tabs. Punto de entrada lazy del ítem de
 * menú CAP-GRUPOS (/capacitacion/grupos).
 */

import { HorariosListProvider } from '@application-capacitacion/grupos/providers/HorariosListProvider';
import { GruposListProvider } from '@application-capacitacion/grupos/providers/GruposListProvider';
import GruposPage from '@capacitacion/grupos/pages/GruposPage';

const GruposConnector = () => (
  <HorariosListProvider>
    <GruposListProvider>
      <GruposPage />
    </GruposListProvider>
  </HorariosListProvider>
);

export default GruposConnector;
