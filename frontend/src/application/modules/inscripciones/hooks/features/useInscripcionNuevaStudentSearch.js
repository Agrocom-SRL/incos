/**
 * Hook: useInscripcionNuevaStudentSearch
 * 
 * Single Responsibility: Orquestar la búsqueda y selección de estudiantes para el wizard de inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia del módulo de estudiantes
 * - Usa hooks de API del módulo de estudiantes (cross-module dependency)
 * 
 * Este hook:
 * - Encapsula el uso de useSearchStudent del módulo de estudiantes
 * - Maneja la selección del estudiante (guarda el ID para usar en step2)
 * - Agrega lógica específica para el wizard de inscripciones si es necesario
 * - Expone una interfaz específica para el contexto de inscripciones
 * 
 * Ventajas:
 * - Encapsula la dependencia entre módulos
 * - Permite agregar lógica específica de inscripciones sin modificar el hook genérico
 * - Facilita el testing y mantenimiento
 * - Separa la lógica del Provider (Provider solo orquesta)
 */

import { useState, useCallback } from 'react';
import { useSearchStudent } from '@application-estudiantes/hooks/api';

/**
 * Hook para buscar y seleccionar estudiantes en el contexto de inscripción nueva
 * 
 * @returns {Object} Objeto con students, loading, error, searchStudent, refetch, selectedStudent, onSelectStudent
 */
export const useInscripcionNuevaStudentSearch = () => {
  // Usar el hook genérico de búsqueda de estudiantes
  const { students, loading, error, searchStudent, refetch } = useSearchStudent();

  // Estado para el estudiante seleccionado (se usará en step2 para cargar datos académicos)
  const [selectedStudent, setSelectedStudent] = useState(null);

  /**
   * Función para manejar la selección de un estudiante
   * Guarda el ID y datos básicos del estudiante para usarlos en step2
   * 
   * @param {Object} student - Estudiante seleccionado (con id, codigoEstudiante, nombreCompleto, ciCompleto)
   */
  const onSelectStudent = useCallback((student) => {
    if (student && student.id) {
      setSelectedStudent({
        id: student.id,
        codigoEstudiante: student.codigoEstudiante,
        nombreCompleto: student.nombreCompleto,
        ciCompleto: student.ciCompleto,
      });
    }
  }, []);

  // TODO: Aquí se puede agregar lógica específica de inscripciones si es necesario
  // Por ejemplo: filtrar estudiantes que ya están inscritos, validaciones específicas, etc.

  return {
    students,
    loading,
    error,
    searchStudent,
    refetch,
    selectedStudent, // Estudiante seleccionado (se usa en step2)
    onSelectStudent, // Callback para seleccionar un estudiante
  };
};
