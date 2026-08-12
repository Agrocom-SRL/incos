/**
 * Hook: usePagosContext
 * 
 * Single Responsibility: Consumir el contexto global de pagos
 * 
 * Clean Architecture:
 * - Application Layer: Hook para acceder al contexto global de pagos
 * 
 * Este hook:
 * - Obtiene el contexto global de pagos
 * - Lanza error si se usa fuera del Provider
 */

import { useContext } from 'react';
import { PagosContext } from '../../context/PagosContext';

export const usePagosContext = () => {
    const context = useContext(PagosContext);

    if (!context) {
        throw new Error('usePagosContext debe ser usado dentro de PagosProvider');
    }

    return context;
};
