import { HorariosPublicacionContext } from '../context/HorariosPublicacionContext';
import { useGestionHorariosPublicacionState } from '../hooks/state/useGestionHorariosPublicacionState';

export function HorariosPublicacionProvider({ children }) {
    const value = useGestionHorariosPublicacionState();
    return (
        <HorariosPublicacionContext.Provider value={value}>{children}</HorariosPublicacionContext.Provider>
    );
}
