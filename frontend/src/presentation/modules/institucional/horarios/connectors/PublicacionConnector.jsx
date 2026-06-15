import { HorariosPublicacionProvider } from '@application-institucional/horarios';
import GestionHorariosPublicacionPage from '../pages/GestionHorariosPublicacionPage';

const PublicacionConnector = () => {
    return (
        <HorariosPublicacionProvider>
            <GestionHorariosPublicacionPage />
        </HorariosPublicacionProvider>
    );
};

export default PublicacionConnector;
