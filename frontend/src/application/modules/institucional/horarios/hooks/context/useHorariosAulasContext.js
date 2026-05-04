import { useContext } from 'react';
import { HorariosAulasContext } from '@application-institucional/horarios/context';

export const useHorariosAulasContext = () => {
    const ctx = useContext(HorariosAulasContext);
    if (!ctx) {
        throw new Error('useHorariosAulasContext debe usarse dentro de HorariosAulasProvider');
    }
    return ctx;
};
