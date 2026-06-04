import { HorariosConflictosContext } from '@application-institucional/horarios/context/HorariosConflictosContext';
import { useGestionHorariosConflictosState } from '@application-institucional/horarios/hooks/state/useGestionHorariosConflictosState';

export const HorariosConflictosProvider = ({ children }) => {
    const value = useGestionHorariosConflictosState();
    return (
        <HorariosConflictosContext.Provider value={value}>{children}</HorariosConflictosContext.Provider>
    );
};
