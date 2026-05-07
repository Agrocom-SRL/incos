import { HorariosProvider } from '@application-institucional/horarios';
import GestionHorariosPublicacionPage from '../pages/GestionHorariosPublicacionPage';

const PublicacionConnector = () => {
    return (
        <HorariosProvider>
            <GestionHorariosPublicacionPage />
        </HorariosProvider>
    );
};

export default PublicacionConnector;
