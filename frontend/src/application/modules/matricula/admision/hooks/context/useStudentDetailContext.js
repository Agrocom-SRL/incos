/**
 * Hook: useStudentDetailContext
 * 
 * Single Responsibility: Consumir el contexto de detalle de estudiante
 * 
 * Clean Architecture:
 * - Application Layer: Accede al estado del detalle de estudiante
 * - Proporciona datos y métodos para obtener/recargar el estudiante
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { useContext } from 'react';
import { StudentDetailContext } from '@application-matricula/admision/context/StudentDetailContext';

/**
 * Hook para consumir el contexto de detalle de estudiante
 * 
 * @returns {Object} Contexto de detalle de estudiante con:
 * - student: Objeto con el estudiante completo y sus datos relacionados (mapeado)
 * - loading: Estado de carga
 * - error: Error si existe
 * - getStudentById: Función para obtener un estudiante por ID
 * - refetch: Función para recargar el estudiante actual
 * @throws {Error} Si se usa fuera del StudentDetailProvider
 */
export const useStudentDetailContext = () => {
  const context = useContext(StudentDetailContext);
  if (!context) {
    throw new Error('useStudentDetailContext must be used within StudentDetailProvider');
  }
  return context;
};

