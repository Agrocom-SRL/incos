import { HorariosPlantillaProvider } from '@application-institucional/horarios';
import GestionHorariosPlantillaPage from '../pages/GestionHorariosPlantillaPage';

const PlantillaConnector = () => {
    return (
        <HorariosPlantillaProvider>
            <GestionHorariosPlantillaPage />
        </HorariosPlantillaProvider>
    );
};

export default PlantillaConnector;
