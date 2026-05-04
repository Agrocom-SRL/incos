import { useContext } from 'react';
import { HorariosPlantillaContext } from '@application-institucional/horarios/context';

export const useHorariosPlantillaContext = () => {
    const ctx = useContext(HorariosPlantillaContext);
    if (!ctx) {
        throw new Error('useHorariosPlantillaContext debe usarse dentro de HorariosPlantillaProvider');
    }
    return ctx;
};
