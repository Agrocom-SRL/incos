/**
 * Provider: StudentProvider
 * 
 * Single Responsibility: Solo maneja el estado compartido del módulo de estudiantes
 * Open/Closed: Abierto para extensión, cerrado para modificación
 */

import { useCallback, useState } from 'react';
import { useCreateStudent, useUpdateStudent, useStudentFormData } from '../hooks';
import { StudentContext } from '../context/StudentContext';

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
    estadosCiviles,
    tiposParentesco,
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
    // Pasar documentacionInscripcion para obtener tipoDocumento al subir archivos
    const result = await createStudent(studentData, documentacionInscripcion);
    
    if (result.success) {
      // Refrescar datos del formulario (estadísticas actualizadas)
      await refetchFormData();
    }
    
    return result;
  }, [createStudent, documentacionInscripcion, refetchFormData]);

  /**
   * Maneja la actualización/creación de estudiante en el wizard
   * Crea en el primer paso, actualiza en los siguientes
   */
  const handleWizardSubmit = useCallback(async (studentData, step, isFinalStep, isTemporarySave = false) => {
    console.log(`[StudentProvider] handleWizardSubmit llamado:`, {
      step,
      isFinalStep,
      isTemporarySave,
      currentStudentId,
      estudianteIdEnDatos: studentData.estudianteId || studentData.id,
      studentDataKeys: Object.keys(studentData),
    });
    
    // Verificar si hay un estudianteId en los datos (viene de la URL cuando se completa registro)
    const estudianteIdEnDatos = studentData.estudianteId || studentData.id;
    // Priorizar: currentStudentId (de la URL) > estudianteIdEnDatos (de los datos) > null
    const studentIdToUse = currentStudentId || estudianteIdEnDatos;
    
    console.log(`[StudentProvider] studentIdToUse determinado:`, {
      currentStudentId,
      estudianteIdEnDatos,
      studentIdToUse,
      decision: studentIdToUse ? 'ACTUALIZAR' : 'CREAR',
    });
    
    // Si hay un ID, asegurarse de que esté en los datos para que el hook lo detecte
    if (studentIdToUse && !studentData.estudianteId && !studentData.id) {
      studentData.estudianteId = studentIdToUse;
      console.log(`[StudentProvider] Agregado estudianteId a studentData:`, studentIdToUse);
    }
    
    // Pasar documentacionInscripcion para obtener tipoDocumento al subir archivos
    const result = await updateStudent(studentIdToUse, studentData, step, isFinalStep, isTemporarySave, documentacionInscripcion);
    
    // Si se creó un nuevo estudiante (primer paso), guardar el ID
    if (result.success && result.studentId && !currentStudentId && !estudianteIdEnDatos) {
      setCurrentStudentId(result.studentId);
    } else if (estudianteIdEnDatos && !currentStudentId) {
      // Si viene un estudianteId de los datos (completar registro), usarlo
      setCurrentStudentId(estudianteIdEnDatos);
    }
    
    // Si es el último paso y fue exitoso, refrescar datos y limpiar ID
    if (result.success && isFinalStep) {
      await refetchFormData();
      setCurrentStudentId(null);
    }
    
    return result;
  }, [updateStudent, currentStudentId, documentacionInscripcion, refetchFormData]);

  // Método para establecer el currentStudentId desde fuera (útil cuando se carga un estudiante desde la URL)
  const setCurrentStudentIdFromOutside = useCallback((studentId) => {
    if (studentId) {
      setCurrentStudentId(studentId);
    }
  }, []);

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
    estadosCiviles,
    tiposParentesco,
    documentacionInscripcion,
    
    // Estados
    currentStudentId,
    
    // Acciones (POST)
    createStudent: handleCreateStudent,
    // Acciones para wizard (crea/actualiza según el paso)
    wizardSubmit: handleWizardSubmit,
    refetchFormData,
    setCurrentStudentId: setCurrentStudentIdFromOutside,
    
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

