import { HorariosPlantillaContext } from '@application-institucional/horarios/context';
import { useGestionHorariosPlantillaState } from '@application-institucional/horarios/hooks/state/useGestionHorariosPlantillaState';

export const HorariosPlantillaProvider = ({ children }) => {
    const value = useGestionHorariosPlantillaState();
    return <HorariosPlantillaContext.Provider value={value}>{children}</HorariosPlantillaContext.Provider>;
};
