/**
 * Hook: useStudentContext
 * 
 * Single Responsibility: Consumir el contexto principal de estudiantes (estado compartido)
 * 
 * Clean Architecture:
 * - Application Layer: Accede al estado compartido de estudiantes en memoria
 * - Proporciona datos y métodos para CRUD en memoria
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { useContext } from 'react';
import { StudentContext } from '@application-matricula/admision/context/StudentContext';

/**
 * Hook para consumir el contexto principal de estudiantes
 * 
 * @returns {Object} Contexto de estudiantes con:
 * - estudiantes: Array de estudiantes (estado en memoria)
 * - loading: Estado de carga
 * - error: Error si existe
 * - addStudent: Función para agregar estudiante al estado
 * - updateStudent: Función para actualizar estudiante en el estado
 * - removeStudent: Función para eliminar estudiante del estado
 * - refetch: Función para sincronizar con BD
 * @throws {Error} Si se usa fuera del StudentProvider
 */
export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within StudentProvider');
  }
  return context;
};

