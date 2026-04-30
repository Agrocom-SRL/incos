import { HorariosProvider } from '@application-institucional/horarios';
import GestionHorariosConflictosPage from '../pages/GestionHorariosConflictosPage';

const ConflictosConnector = () => {
    return (
        <HorariosProvider>
            <GestionHorariosConflictosPage />
        </HorariosProvider>
    );
};

export default ConflictosConnector;
