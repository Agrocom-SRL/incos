import { CalificacionesPlanProvider } from '@application-academico/calificaciones/providers/CalificacionesPlanProvider.jsx';
import CalificacionesPlanPage from '../pages/CalificacionesPlanPage.jsx';

const PlanConnector = () => (
  <CalificacionesPlanProvider>
    <CalificacionesPlanPage />
  </CalificacionesPlanProvider>
);

export default PlanConnector;
