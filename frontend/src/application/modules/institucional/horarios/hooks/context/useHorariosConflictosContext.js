import { useContext } from 'react';
import { HorariosConflictosContext } from '@application-institucional/horarios/context/HorariosConflictosContext';

export const useHorariosConflictosContext = () => {
    const ctx = useContext(HorariosConflictosContext);
    if (!ctx) {
        throw new Error('useHorariosConflictosContext debe usarse dentro de HorariosConflictosProvider');
    }
    return ctx;
};
