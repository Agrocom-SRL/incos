import { HorariosAulasContext } from '@application-institucional/horarios/context';
import { useGestionHorariosAulasState } from '@application-institucional/horarios/hooks/state/useGestionHorariosAulasState';

export const HorariosAulasProvider = ({ children }) => {
    const value = useGestionHorariosAulasState();
    return <HorariosAulasContext.Provider value={value}>{children}</HorariosAulasContext.Provider>;
};
