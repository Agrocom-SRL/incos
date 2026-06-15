import { useContext } from 'react';
import { HorariosPublicacionContext } from '../../context/HorariosPublicacionContext';

export function useHorariosPublicacionContext() {
    const ctx = useContext(HorariosPublicacionContext);
    if (!ctx) {
        throw new Error('useHorariosPublicacionContext debe usarse dentro de HorariosPublicacionProvider');
    }
    return ctx;
}
