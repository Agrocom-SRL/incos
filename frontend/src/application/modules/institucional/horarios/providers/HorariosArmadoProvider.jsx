import { HorariosArmadoContext } from '@application-institucional/horarios/context';
import { useGestionHorariosArmadoState } from '@application-institucional/horarios/hooks/state/useGestionHorariosArmadoState';
import { useGestionHorariosPlantillaState } from '@application-institucional/horarios/hooks/state/useGestionHorariosPlantillaState';

export const HorariosArmadoProvider = ({ children }) => {
    const armadoState = useGestionHorariosArmadoState();
    const ofertaParalelo = useGestionHorariosPlantillaState();
    const value = {
        ...armadoState,
        ofertaParalelo,
    };
    return <HorariosArmadoContext.Provider value={value}>{children}</HorariosArmadoContext.Provider>;
};
