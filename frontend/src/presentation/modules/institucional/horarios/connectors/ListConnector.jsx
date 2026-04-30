import { HorariosProvider } from '@application-institucional/horarios';
import GestionHorariosPage from '../pages/GestionHorariosPage';

const ListConnector = () => {
    return (
        <HorariosProvider>
            <GestionHorariosPage />
        </HorariosProvider>
    );
};

export default ListConnector;
