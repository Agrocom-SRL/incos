import { HorariosArmadoContext } from '@application-institucional/horarios/context';
import { useGestionHorariosArmadoState } from '@application-institucional/horarios/hooks/state/useGestionHorariosArmadoState';

export const HorariosArmadoProvider = ({ children }) => {
    const value = useGestionHorariosArmadoState();
    return <HorariosArmadoContext.Provider value={value}>{children}</HorariosArmadoContext.Provider>;
};
