/**
 * Hook: usePagosListContext
 * 
 * Single Responsibility: Consumir el contexto de lista de pagos
 * 
 * Clean Architecture:
 * - Application Layer: Hook para acceder al contexto de lista de pagos
 */

import { useContext } from 'react';
import { PagosListContext } from '@application-pagos/context/PagosListContext';

export const usePagosListContext = () => {
    const context = useContext(PagosListContext);
    if (!context) {
        throw new Error('usePagosListContext debe usarse dentro de PagosListProvider');
    }
    return context;
};
