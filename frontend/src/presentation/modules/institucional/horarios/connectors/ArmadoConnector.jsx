import { HorariosProvider } from '@application-institucional/horarios';
import GestionHorariosArmadoPage from '../pages/GestionHorariosArmadoPage';

const ArmadoConnector = () => {
    return (
        <HorariosProvider>
            <GestionHorariosArmadoPage />
        </HorariosProvider>
    );
};

export default ArmadoConnector;
