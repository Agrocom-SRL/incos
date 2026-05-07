import { useContext } from 'react';
import { HorariosArmadoContext } from '@application-institucional/horarios/context';

export const useHorariosArmadoContext = () => {
    const ctx = useContext(HorariosArmadoContext);
    if (!ctx) {
        throw new Error('useHorariosArmadoContext debe usarse dentro de HorariosArmadoProvider');
    }
    return ctx;
};
