/**
 * Hook: useNavigationContext
 * 
 * Single Responsibility: Consumir el contexto de navegación
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { useContext } from 'react';
import { NavigationContext } from '@application-navigation/context/NavigationContext';

/**
 * Hook para consumir el contexto de navegación
 * @returns {Object} Contexto de navegación
 * @throws {Error} Si se usa fuera del NavigationProvider
 */
export const useNavigationContext = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigationContext must be used within NavigationProvider');
    }
    return context;
};

