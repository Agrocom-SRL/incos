/**
 * Hook: useInscripcionesListContext
 * 
 * Single Responsibility: Consumir el contexto de lista de inscripciones
 * 
 * Clean Architecture:
 * - Application Layer: Hook para acceder al contexto de lista de inscripciones
 */

import { useContext } from 'react';
import { InscripcionesListContext } from '@application-matricula/registro/context/InscripcionesListContext';

export const useInscripcionesListContext = () => {
    const context = useContext(InscripcionesListContext);
    if (!context) {
        throw new Error('useInscripcionesListContext debe usarse dentro de InscripcionesListProvider');
    }
    return context;
};
