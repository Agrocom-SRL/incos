/**
 * Hook: usePagosContextOptional
 * 
 * Single Responsibility: Consumir el contexto global de pagos de manera opcional
 * 
 * Clean Architecture:
 * - Application Layer: Hook para acceder al contexto global de pagos de forma opcional
 * 
 * Este hook:
 * - Obtiene el contexto global de pagos
 * - Retorna null si no está disponible (no lanza error)
 * - Útil para componentes que pueden funcionar sin el contexto de pagos
 */

import { useContext } from 'react';
import { PagosContext } from '../../context/PagosContext';

export const usePagosContextOptional = () => {
    const context = useContext(PagosContext);
    
    // Retornar null si no está disponible (no lanzar error)
    return context;
};
