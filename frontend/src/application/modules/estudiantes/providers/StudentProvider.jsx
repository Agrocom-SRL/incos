/**
 * Provider: StudentProvider
 * 
 * Single Responsibility: Solo maneja el estado compartido del módulo de estudiantes
 * Open/Closed: Abierto para extensión, cerrado para modificación
 */

import { createContext, useContext, useCallback, useState } from 'react';
import { useCreateStudent, useUpdateStudent, useStudentFormData } from '../hooks';

const StudentContext = createContext(null);

export const StudentProvider = ({ children }) => {
  // Hook para obtener datos iniciales (GET) - cuando se carga la página
  const {
    stats,
    expediciones,
    generos,
    tiposSangre,
    carreras,
    gestiones,
    paises,
    departamentos,
    provincias,
    municipios,
    idiomas,
    tiposDiscapacidad,
    documentacionInscripcion,
    loading: loadingFormData,
    error: formDataError,
    refetch: refetchFormData,
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
  } = useStudentFormData();

  // Hook para crear estudiante (POST) - cuando se envía el formulario
  const { createStudent, loading: creating, error: createError } = useCreateStudent();
  
  // Hook para actualizar estudiante (PUT) - para el wizard
  const { updateStudent, loading: updating, error: updateError } = useUpdateStudent();
  
  // Estado para mantener el ID del estudiante durante el wizard
  const [currentStudentId, setCurrentStudentId] = useState(null);

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

  /**
   * Maneja la actualización/creación de estudiante en el wizard
   * Crea en el primer paso, actualiza en los siguientes
   */
  const handleWizardSubmit = useCallback(async (studentData, step, isFinalStep) => {
    const result = await updateStudent(currentStudentId, studentData, step, isFinalStep);
    
    // Si se creó un nuevo estudiante (primer paso), guardar el ID
    if (result.success && result.studentId && !currentStudentId) {
      setCurrentStudentId(result.studentId);
    }
    
    // Si es el último paso y fue exitoso, refrescar datos y limpiar ID
    if (result.success && isFinalStep) {
      await refetchFormData();
      setCurrentStudentId(null);
    }
    
    return result;
  }, [updateStudent, currentStudentId, refetchFormData]);

  const value = {
    // Datos para mostrar en la página (GET)
    stats,
    expediciones,
    generos,
    tiposSangre,
    carreras,
    gestiones,
    paises,
    departamentos,
    provincias,
    municipios,
    idiomas,
    tiposDiscapacidad,
    documentacionInscripcion,
    
    // Acciones (POST)
    createStudent: handleCreateStudent,
    // Acciones para wizard (crea/actualiza según el paso)
    wizardSubmit: handleWizardSubmit,
    refetchFormData,
    
    // Funciones para cargar datos geográficos en cascada
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
    
    // Estados de carga
    loading: creating || updating || loadingFormData,
    creating, // Solo creación
    updating, // Solo actualización
    loadingFormData, // Solo carga de datos
    
    // Errores
    error: createError || updateError || formDataError,
    createError,
    updateError,
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

