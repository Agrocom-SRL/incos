/**
 * Hook: useAsignarBecaContext
 * 
 * Single Responsibility: Consumir el contexto de asignar beca
 * 
 * Clean Architecture:
 * - Application Layer: Hook para consumir el contexto (Presentation Layer)
 * 
 * Este hook:
 * - Consume el contexto AsignarBecaContext
 * - Valida que el contexto esté disponible
 * - Retorna el valor del contexto
 * 
 * Nota: Este hook CONSUME el contexto.
 * Para GESTIONAR el estado del contexto, usa useAsignarBecaData en state/.
 */

import { useContext } from 'react';
import { AsignarBecaContext } from '@application-matricula/becas/context/AsignarBecaContext';

/**
 * Hook para consumir el contexto de asignar beca
 * 
 * @returns {Object} Valor del contexto de asignar beca
 * @throws {Error} Si el contexto no está disponible (Provider no está montado)
 */
export const useAsignarBecaContext = () => {
  const context = useContext(AsignarBecaContext);

  if (!context) {
    throw new Error('useAsignarBecaContext debe ser usado dentro de AsignarBecaProvider');
  }

  return context;
};
