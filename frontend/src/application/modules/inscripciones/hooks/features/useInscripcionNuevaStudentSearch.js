/**
 * Hook: useInscripcionNuevaStudentSearch
 * 
 * Single Responsibility: Orquestar la búsqueda de estudiantes para el wizard de inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia del módulo de estudiantes
 * - Usa hooks de API del módulo de estudiantes (cross-module dependency)
 * 
 * Este hook:
 * - Encapsula el uso de useSearchStudent del módulo de estudiantes
 * - Agrega lógica específica para el wizard de inscripciones si es necesario
 * - Expone una interfaz específica para el contexto de inscripciones
 * 
 * Ventajas:
 * - Encapsula la dependencia entre módulos
 * - Permite agregar lógica específica de inscripciones sin modificar el hook genérico
 * - Facilita el testing y mantenimiento
 */

import { useSearchStudent } from '@application-estudiantes/hooks/api';

/**
 * Hook para buscar estudiantes en el contexto de inscripción nueva
 * 
 * @returns {Object} Objeto con students, loading, error, searchStudent, refetch
 */
export const useInscripcionNuevaStudentSearch = () => {
  // Usar el hook genérico de búsqueda de estudiantes
  const { students, loading, error, searchStudent, refetch } = useSearchStudent();

  // TODO: Aquí se puede agregar lógica específica de inscripciones si es necesario
  // Por ejemplo: filtrar estudiantes que ya están inscritos, validaciones específicas, etc.

  return {
    students,
    loading,
    error,
    searchStudent,
    refetch,
  };
};
