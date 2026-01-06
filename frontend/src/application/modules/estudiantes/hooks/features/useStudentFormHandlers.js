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

import { useCallback, useRef, useState } from 'react';
import { useRegisterStudent } from '@application-estudiantes/hooks/api';

/**
 * Hook para gestionar handlers de submit del formulario de registro
 * 
 * @param {Function} showMessage - Función para mostrar mensajes (debe venir del provider)
 * @returns {Object} Objeto con handleFinish, handleSave, registerForm, getFormValues, loading, error, validationErrors, registrationResult
 */
export const useStudentFormHandlers = (showMessage) => {
  // Hook de API para registro de estudiantes
  const { registerStudent, loading, error, validationErrors } = useRegisterStudent();
  // Ref para almacenar la instancia del formulario
  const formRef = useRef(null);
  // Estado para almacenar el resultado del registro (para que la página pueda reaccionar)
  const [registrationResult, setRegistrationResult] = useState(null);

  // Función para registrar el formulario desde la página
  const registerForm = useCallback((formInstance) => {
    formRef.current = formInstance;
  }, []);

  // Función para obtener los valores del formulario
  const getFormValues = useCallback(() => {
    if (!formRef.current) {
      console.warn('⚠️ El formulario no está registrado aún');
      return {};
    }
    try {
      // Obtener todos los valores del formulario (incluye campos no renderizados)
      const formValues = formRef.current.getFieldsValue(true);
      return formValues;
    } catch (error) {
      console.error('❌ Error al obtener valores del formulario:', error);
      return {};
    }
  }, []);

  // Handler para finalizar el registro
  const handleFinish = useCallback(async (step) => {
    const formValues = getFormValues ? getFormValues() : {};
    const result = await registerStudent(formValues, step, true, false);
    
    if (result?.success) {
      if (showMessage) {
        showMessage('success', 'Estudiante registrado correctamente');
      }
      // Guardar el resultado para que la página pueda reaccionar
      setRegistrationResult(result);
    } else if (result?.error) {
      if (showMessage) {
        const msg = typeof result.error === 'object'
          ? (result.error.message || 'Error al registrar estudiante')
          : (result.error || 'Error al registrar estudiante');
        showMessage('error', msg);
      }
      // Limpiar resultado anterior en caso de error
      setRegistrationResult(null);
    }
  }, [registerStudent, showMessage, getFormValues]);

  // Handler para guardar parcialmente
  const handleSave = useCallback(async (step) => {
    const formValues = getFormValues ? getFormValues() : {};
    const result = await registerStudent(formValues, step, false, true);
    
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
  }, [registerStudent, showMessage, getFormValues]);

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

