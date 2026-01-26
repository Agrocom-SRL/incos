/**
 * Hook: useStudentFormHandlers
 * 
 * Single Responsibility: Manejar la lógica de submit del formulario de registro
 * 
 * Clean Architecture:
 * - Application Layer: Hook de lógica específica para handlers de formulario
 * - Maneja la lógica completa del formulario: registro, obtención de valores y handlers de submit
 * 
 * SOLID Principles:
 * - Single Responsibility: Única responsabilidad de manejar handlers de submit y gestión del formulario
 * - Dependency Inversion: Depende de useRegisterStudent (abstracción) y showMessage
 * - Interface Segregation: Expone solo los handlers y funciones necesarios
 * 
 * Este hook:
 * - Gestiona el registro de la instancia del formulario
 * - Usa useRegisterStudent para realizar el registro
 * - Procesa handlers de submit (handleFinish, handleSave)
 * - Maneja mensajes y notificaciones
 * - Gestiona callbacks de éxito
 * - Expone estados de registro (loading, error, validationErrors)
 * 
 * Usado por: StudentRegisterProvider (para exponer handlers vía Context)
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { useRegisterStudent, useUpdateStudent } from '@application-estudiantes/hooks/api';

/**
 * Hook para gestionar handlers de submit del formulario de registro/edición
 * 
 * @param {Function} showMessage - Función para mostrar mensajes (debe venir del provider)
 * @param {string} mode - Modo del formulario: 'create' (default) o 'edit'
 * @param {string|number} studentId - ID del estudiante (requerido si mode === 'edit')
 * @param {Array} documentacionProcesada - Array de documentos procesados (para incluir valores por defecto)
 * @returns {Object} Objeto con handleFinish, handleSave, registerForm, getFormValues, loading, error, validationErrors, registrationResult
 */
export const useStudentFormHandlers = (showMessage, mode = 'create', studentId = null, documentacionProcesada = []) => {
  const isEditMode = mode === 'edit';
  
  // Hook de API para registro de estudiantes
  const { registerStudent, loading: loadingRegister, error: errorRegister, validationErrors: validationErrorsRegister } = useRegisterStudent();
  
  // Hook de API para actualización de estudiantes
  const { updateStudent, loading: loadingUpdate, error: errorUpdate, validationErrors: validationErrorsUpdate } = useUpdateStudent();
  
  // Usar el hook apropiado según el modo
  const loading = isEditMode ? loadingUpdate : loadingRegister;
  const error = isEditMode ? errorUpdate : errorRegister;
  const validationErrors = isEditMode ? validationErrorsUpdate : validationErrorsRegister;
  
  // Ref para almacenar la instancia del formulario
  const formRef = useRef(null);
  // Estado para almacenar el resultado del registro/actualización (para que la página pueda reaccionar)
  const [registrationResult, setRegistrationResult] = useState(null);

  // Función para registrar el formulario desde la página
  const registerForm = useCallback((formInstance) => {
    formRef.current = formInstance;
  }, []);

  // Ref para mantener referencia estable de documentacionProcesada
  const documentacionProcesadaRef = useRef(documentacionProcesada);
  
  // Actualizar ref cuando documentacionProcesada cambie
  useEffect(() => {
    documentacionProcesadaRef.current = documentacionProcesada;
  }, [documentacionProcesada]);

  // Función para obtener los valores del formulario
  // IMPORTANTE: Incluye todos los documentos con valores por defecto si no están presentes
  // Esto asegura que todos los documentos se envíen al backend, incluso si el usuario no interactuó con ellos
  const getFormValues = useCallback(() => {
    if (!formRef.current) {
      console.warn('⚠️ El formulario no está registrado aún');
      return {};
    }
    try {
      // Obtener todos los valores del formulario (incluye campos no renderizados)
      const formValues = formRef.current.getFieldsValue(true);
      
      // Asegurar que todos los documentos estén presentes con valores por defecto
      // Si un documento no está en formValues, agregarlo con entregado: true por defecto
      const documentacionProcesada = documentacionProcesadaRef.current;
      if (documentacionProcesada && Array.isArray(documentacionProcesada) && documentacionProcesada.length > 0) {
        // Inicializar documentacion si no existe
        if (!formValues.documentacion) {
          formValues.documentacion = {};
        }
        
        // Para cada documento procesado, asegurar que esté presente
        documentacionProcesada.forEach((documento) => {
          const docKey = `doc_${documento.id}`;
          
          // Si el documento no está presente en formValues, agregarlo con valores por defecto
          if (!formValues.documentacion[docKey]) {
            formValues.documentacion[docKey] = {
              entregado: documento.entregado !== undefined ? documento.entregado : true, // Por defecto true (entregado)
              en_tramite: documento.en_tramite !== undefined ? documento.en_tramite : false,
              observaciones: documento.observaciones || null,
            };
          } else {
            // Si el documento está presente pero no tiene entregado, usar el valor por defecto
            if (formValues.documentacion[docKey].entregado === undefined) {
              formValues.documentacion[docKey].entregado = documento.entregado !== undefined ? documento.entregado : true;
            }
            // Asegurar que en_tramite tenga un valor por defecto si no está presente
            if (formValues.documentacion[docKey].en_tramite === undefined) {
              formValues.documentacion[docKey].en_tramite = documento.en_tramite !== undefined ? documento.en_tramite : false;
            }
            // Asegurar que observaciones tenga un valor por defecto si no está presente
            if (formValues.documentacion[docKey].observaciones === undefined) {
              formValues.documentacion[docKey].observaciones = documento.observaciones || null;
            }
          }
        });
      }
      
      return formValues;
    } catch (error) {
      console.error('❌ Error al obtener valores del formulario:', error);
      return {};
    }
  }, []); // Sin dependencias - usa documentacionProcesadaRef.current

  // Handler para finalizar el registro/actualización
  const handleFinish = useCallback(async (step) => {
    const formValues = getFormValues ? getFormValues() : {};
    
    let result;
    if (isEditMode && studentId) {
      result = await updateStudent(studentId, formValues, step, true, false);
    } else {
      result = await registerStudent(formValues, step, true, false);
    }
    
    if (result?.success) {
      if (showMessage) {
        const message = isEditMode 
          ? 'Estudiante actualizado correctamente'
          : 'Estudiante registrado correctamente';
        showMessage('success', message);
      }
      // Guardar el resultado para que la página pueda reaccionar
      setRegistrationResult(result);
    } else if (result?.error) {
      if (showMessage) {
        const defaultMessage = isEditMode 
          ? 'Error al actualizar estudiante'
          : 'Error al registrar estudiante';
        const msg = typeof result.error === 'object'
          ? (result.error.message || defaultMessage)
          : (result.error || defaultMessage);
        showMessage('error', msg);
      }
      // Limpiar resultado anterior en caso de error
      setRegistrationResult(null);
    }
  }, [isEditMode, studentId, registerStudent, updateStudent, showMessage, getFormValues]);

  // Handler para guardar parcialmente
  const handleSave = useCallback(async (step) => {
    const formValues = getFormValues ? getFormValues() : {};
    
    let result;
    if (isEditMode && studentId) {
      result = await updateStudent(studentId, formValues, step, false, true);
    } else {
      result = await registerStudent(formValues, step, false, true);
    }
    
    if (result?.success) {
      if (showMessage) {
        showMessage('success', 'Datos guardados correctamente. Puede continuar después.');
      }
      // Para guardado parcial, no redirigimos, pero guardamos el resultado por si acaso
      setRegistrationResult(result);
    } else if (result?.error) {
      if (showMessage) {
        const msg = typeof result.error === 'object'
          ? (result.error.message || 'Error al guardar los datos')
          : (result.error || 'Error al guardar los datos');
        showMessage('error', msg);
      }
      // Limpiar resultado anterior en caso de error
      setRegistrationResult(null);
    }
  }, [isEditMode, studentId, registerStudent, updateStudent, showMessage, getFormValues]);

  return {
    handleFinish,
    handleSave,
    registerForm,
    getFormValues,
    formRef, // Exponer formRef para que useDocumentacionProcesada pueda usar Form.useWatch
    // Estados del registro (expuestos desde useRegisterStudent)
    loading,
    error,
    validationErrors,
    // Resultado del registro (para que la página pueda reaccionar)
    registrationResult,
  };
};

