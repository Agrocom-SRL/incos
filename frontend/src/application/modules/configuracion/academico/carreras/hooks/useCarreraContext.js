/**
 * Hook: useCarreraContext
 * 
 * Single Responsibility: Consumir el contexto de carreras
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 * 
 * Ubicación: application/modules/configuracion/academico/carreras
 */

import { useContext } from 'react';
import { CarreraContext } from '../context/CarreraContext';

/**
 * Hook para consumir el contexto de carreras
 * @returns {Object} Contexto de carreras
 * @throws {Error} Si se usa fuera del CarreraProvider
 */
export const useCarreraContext = () => {
  const context = useContext(CarreraContext);
  if (!context) {
    throw new Error('useCarreraContext must be used within CarreraProvider');
  }
  return context;
};

