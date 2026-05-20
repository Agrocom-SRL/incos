import { CalificacionesNotasProvider } from '@application-academico/calificaciones/providers/CalificacionesNotasProvider.jsx';
import CalificacionesNotasPage from '../pages/CalificacionesNotasPage.jsx';

const NotasConnector = () => (
  <CalificacionesNotasProvider>
    <CalificacionesNotasPage />
  </CalificacionesNotasProvider>
);

export default NotasConnector;
