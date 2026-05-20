import { CalificacionesCursosProvider } from '@application-academico/calificaciones/providers/CalificacionesCursosProvider.jsx';
import CalificacionesCursosPage from '../pages/CalificacionesCursosPage.jsx';

const CursosConnector = () => (
  <CalificacionesCursosProvider>
    <CalificacionesCursosPage />
  </CalificacionesCursosProvider>
);

export default CursosConnector;
