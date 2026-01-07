/**
 * Hook: useStudentListContext
 * 
 * Single Responsibility: Consumir el contexto de lista de estudiantes
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { useContext } from 'react';
import { StudentListContext } from '@application-estudiantes/context/StudentListContext';

/**
 * Hook para consumir el contexto de lista de estudiantes
 * @returns {Object} Contexto de lista de estudiantes
 * @throws {Error} Si se usa fuera del StudentListProvider
 */
export const useStudentListContext = () => {
  const context = useContext(StudentListContext);
  if (!context) {
    throw new Error('useStudentListContext must be used within StudentListProvider');
  }
  return context;
};

