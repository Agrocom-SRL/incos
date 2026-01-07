/**
 * Hook: useMateriaContext
 * 
 * Single Responsibility: Consumir el contexto de materias
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 * 
 * Ubicación: application/modules/configuracion/academico/materias
 */

import { useContext } from 'react';
import { MateriaContext } from '@application-configuracion/academico/materias/context/MateriaContext';

/**
 * Hook para consumir el contexto de materias
 * @returns {Object} Contexto de materias
 * @throws {Error} Si se usa fuera del MateriaProvider
 */
export const useMateriaContext = () => {
  const context = useContext(MateriaContext);
  if (!context) {
    throw new Error('useMateriaContext must be used within MateriaProvider');
  }
  return context;
};

