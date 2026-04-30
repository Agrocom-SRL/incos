import { HorariosProvider } from '@application-institucional/horarios';
import GestionHorariosPlantillaPage from '../pages/GestionHorariosPlantillaPage';

const PlantillaConnector = () => {
    return (
        <HorariosProvider>
            <GestionHorariosPlantillaPage />
        </HorariosProvider>
    );
};

export default PlantillaConnector;
