/**
 * Provider: StudentProvider
 * 
 * Single Responsibility: Solo maneja el estado compartido del módulo de estudiantes
 * Open/Closed: Abierto para extensión, cerrado para modificación
 */

import { createContext, useContext, useCallback } from 'react';
import { useCreateStudent, useStudentFormData } from '../hooks';

const StudentContext = createContext(null);

export const StudentProvider = ({ children }) => {
  // Hook para obtener datos iniciales (GET) - cuando se carga la página
  const {
    stats,
    expediciones,
    generos,
    tiposSangre,
    loading: loadingFormData,
    error: formDataError,
    refetch: refetchFormData,
  } = useStudentFormData();

  // Hook para crear estudiante (POST) - cuando se envía el formulario
  const { createStudent, loading: creating, error: createError } = useCreateStudent();

  /**
   * Maneja la creación de un estudiante y actualiza el estado
   */
  const handleCreateStudent = useCallback(async (studentData) => {
    const result = await createStudent(studentData);
    
    if (result.success) {
      // Refrescar datos del formulario (estadísticas actualizadas)
      await refetchFormData();
    }
    
    return result;
  }, [createStudent, refetchFormData]);

  const value = {
    // Datos para mostrar en la página (GET)
    stats,
    expediciones,
    generos,
    tiposSangre,
    
    // Acciones (POST)
    createStudent: handleCreateStudent,
    refetchFormData,
    
    // Estados de carga
    loading: creating || loadingFormData,
    creating, // Solo creación
    loadingFormData, // Solo carga de datos
    
    // Errores
    error: createError || formDataError,
    createError,
    formDataError,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

/**
 * Hook para consumir el contexto de estudiantes
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

