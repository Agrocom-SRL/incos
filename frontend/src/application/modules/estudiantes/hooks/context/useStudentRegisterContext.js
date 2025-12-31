/**
 * Hook: useStudentRegisterContext
 * 
 * Single Responsibility: Consumir el contexto de registro de estudiantes
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { useContext } from 'react';
import { StudentRegisterContext } from '../../context/StudentRegisterContext';

/**
 * Hook para consumir el contexto de registro de estudiantes
 * @returns {Object} Contexto de registro de estudiantes
 * @throws {Error} Si se usa fuera del StudentRegisterProvider
 */
export const useStudentRegisterContext = () => {
  const context = useContext(StudentRegisterContext);
  if (!context) {
    throw new Error('useStudentRegisterContext must be used within StudentRegisterProvider');
  }
  return context;
};

