import { useContext } from 'react';
import { HorariosContext } from '@application-institucional/horarios/context';

export const useHorariosContext = () => {
    const ctx = useContext(HorariosContext);
    if (!ctx) {
        throw new Error('useHorariosContext debe usarse dentro de HorariosProvider');
    }
    return ctx;
};
