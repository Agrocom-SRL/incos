/**
 * Entrada Calificaciones — delega en ModuleEntryConnector + landingStack (routes ACA-CAL).
 */

import ModuleEntryConnector from '@navigation/components/ModuleEntryConnector.jsx';
import CoordinacionPage from '../pages/CoordinacionPage.jsx';

const CalificacionesEntradaConnector = () => (
  <ModuleEntryConnector menuKey="ACA-CAL" inlineElement={<CoordinacionPage />} />
);

export default CalificacionesEntradaConnector;
