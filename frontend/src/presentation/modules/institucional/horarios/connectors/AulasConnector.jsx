import { HorariosAulasProvider } from '@application-institucional/horarios';
import GestionHorariosAulasPage from '../pages/GestionHorariosAulasPage';

const AulasConnector = () => {
    return (
        <HorariosAulasProvider>
            <GestionHorariosAulasPage />
        </HorariosAulasProvider>
    );
};

export default AulasConnector;
