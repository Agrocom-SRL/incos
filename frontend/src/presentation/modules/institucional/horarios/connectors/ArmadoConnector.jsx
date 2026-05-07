import { HorariosArmadoProvider } from '@application-institucional/horarios';
import GestionHorariosArmadoPage from '../pages/GestionHorariosArmadoPage';

const ArmadoConnector = () => {
    return (
        <HorariosArmadoProvider>
            <GestionHorariosArmadoPage />
        </HorariosArmadoProvider>
    );
};

export default ArmadoConnector;
