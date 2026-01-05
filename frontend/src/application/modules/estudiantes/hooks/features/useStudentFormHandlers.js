/**
 * Hook: useStudentFormHandlers
 * 
 * Single Responsibility: Manejar la lógica de submit del formulario de registro
 * 
 * Clean Architecture:
 * - Application Layer: Hook de lógica específica para handlers de formulario
 * - Solo se encarga de procesar handlers de submit (onFinish, onSave)
 * 
 * SOLID Principles:
 * - Single Responsibility: Única responsabilidad de manejar handlers de submit
 * - Dependency Inversion: Depende de funciones inyectadas (onSubmit, onSuccess, showMessage)
 * - Interface Segregation: Expone solo los handlers necesarios
 * 
 * Este hook:
 * - Procesa handlers de submit (handleFinish, handleSave)
 * - Maneja mensajes y notificaciones
 * - Gestiona callbacks de éxito
 * 
 * Usado por: StudentRegisterProvider (para exponer handlers vía Context)
 */

import { useCallback } from 'react';

/**
 * Hook para gestionar handlers de submit del formulario de registro
 * 
 * @param {Function} onSubmit - Función para enviar datos (debe venir del provider)
 * @param {Function} onSuccess - Función de callback de éxito (debe venir del provider)
 * @param {Function} showMessage - Función para mostrar mensajes (debe venir del provider)
 * @returns {Object} Objeto con handleFinish y handleSave
 */
export const useStudentFormHandlers = (onSubmit, onSuccess, showMessage) => {
  // Handler para finalizar el registro
  const handleFinish = useCallback(async (step) => {
    if (onSubmit) {
      const result = await onSubmit({}, step, true, false);
      if (result?.success) {
        if (showMessage) {
          showMessage('success', 'Estudiante registrado correctamente');
        }
        if (onSuccess) {
          onSuccess(result);
        }
      } else if (result?.error) {
        if (showMessage) {
          showMessage('error', result.error || 'Error al registrar estudiante');
        }
      }
    }
  }, [onSubmit, onSuccess, showMessage]);

  // Handler para guardar parcialmente
  const handleSave = useCallback(async (step) => {
    if (onSubmit) {
      const result = await onSubmit({}, step, false, true);
      if (result?.success) {
        if (showMessage) {
          showMessage('success', 'Datos guardados correctamente. Puede continuar después.');
        }
        if (onSuccess) {
          onSuccess(result);
        }
      } else if (result?.error) {
        if (showMessage) {
          showMessage('error', result.error || 'Error al guardar los datos');
        }
      }
    }
  }, [onSubmit, onSuccess, showMessage]);

  return {
    handleFinish,
    handleSave,
  };
};

