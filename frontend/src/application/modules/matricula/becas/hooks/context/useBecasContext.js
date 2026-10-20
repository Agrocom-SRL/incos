/**
 * Hook: useBecasContext
 * 
 * Single Responsibility: Consumir el contexto global de becas
 * 
 * Clean Architecture:
 * - Application Layer: Hook para acceder al contexto de becas
 */

import { useContext } from 'react';
import { BecasContext } from '@application-matricula/becas/context/BecasContext';

export const useBecasContext = () => {
    const context = useContext(BecasContext);
    if (!context) {
        throw new Error('useBecasContext debe usarse dentro de BecasProvider');
    }
    return context;
};
