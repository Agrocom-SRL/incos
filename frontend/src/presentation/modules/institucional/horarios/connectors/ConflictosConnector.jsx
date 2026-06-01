import { HorariosConflictosProvider } from '@application-institucional/horarios/providers/HorariosConflictosProvider';
import GestionHorariosConflictosPage from '../pages/GestionHorariosConflictosPage';

const ConflictosConnector = () => (
  <HorariosConflictosProvider>
    <GestionHorariosConflictosPage />
  </HorariosConflictosProvider>
);

export default ConflictosConnector;
