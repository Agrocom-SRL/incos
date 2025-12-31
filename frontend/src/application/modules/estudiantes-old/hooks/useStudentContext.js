/**
 * Hook: useStudentContext
 * 
 * Single Responsibility: Consumir el contexto de estudiantes del módulo estudiantes-old
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { useContext } from 'react';
import { StudentContext } from '../context/StudentContext';

/**
 * Hook para consumir el contexto de estudiantes del módulo estudiantes-old
 * @returns {Object} Contexto de estudiantes
 * @throws {Error} Si se usa fuera del StudentProvider
 */
export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within StudentProvider');
  }
  return context;
};

