import { HorariosProvider } from '@application-institucional/horarios';
import GestionHorariosAulasPage from '../pages/GestionHorariosAulasPage';

const AulasConnector = () => {
    return (
        <HorariosProvider>
            <GestionHorariosAulasPage />
        </HorariosProvider>
    );
};

export default AulasConnector;
