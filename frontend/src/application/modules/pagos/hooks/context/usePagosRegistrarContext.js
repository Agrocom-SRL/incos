/**
 * Hook: usePagosRegistrarContext
 * 
 * Single Responsibility: Consumir el contexto de registro de pagos
 * 
 * Clean Architecture:
 * - Application Layer: Hook para acceder al contexto de registro de pagos
 * 
 * Este hook:
 * - Obtiene el contexto de registro de pagos
 * - Lanza error si se usa fuera del Provider
 */

import { useContext } from 'react';
import { PagosRegistrarContext } from '../../context/PagosRegistrarContext';

export const usePagosRegistrarContext = () => {
    const context = useContext(PagosRegistrarContext);

    if (!context) {
        throw new Error('usePagosRegistrarContext debe ser usado dentro de PagosRegistrarProvider');
    }

    return context;
};
