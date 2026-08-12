/**
 * Hook: useBecasListContext
 * 
 * Single Responsibility: Consumir el contexto de lista de becas
 * 
 * Clean Architecture:
 * - Application Layer: Hook para acceder al contexto de lista de becas
 */

import { useContext } from 'react';
import { BecasListContext } from '@application-matricula/becas/context/BecasListContext';

export const useBecasListContext = () => {
    const context = useContext(BecasListContext);
    if (!context) {
        throw new Error('useBecasListContext debe usarse dentro de BecasListProvider');
    }
    return context;
};
