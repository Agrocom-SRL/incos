/**
 * Hook: useStudentRegisterLogic
 * 
 * Single Responsibility: Gestionar la lógica del formulario de registro de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Hook de lógica específica para la feature de registro
 * - Maneja transformación de datos (resolveOptions), handlers de submit (onFinish, onSave)
 * - Recibe datos del contexto y expone la lógica procesada para la página
 * 
 * Este hook:
 * - Transforma datos del contexto en formato consumible (resolveOptions)
 * - Procesa handlers de submit (onFinish, onSave)
 * - Maneja mensajes y notificaciones
 * 
 * Usado por: StudentRegisterProvider (para exponer la lógica vía Context)
 */

import { useMemo, useCallback } from 'react';
import { transformToOptions } from '../../utils/formFieldOptionMappers';

/**
 * Hook para gestionar la lógica del formulario de registro de estudiantes
 * 
 * @param {Object} contextData - Datos del contexto (expediciones, generos, paises, etc.)
 * @param {number} minAge - Edad mínima requerida para registro (en años)
 * @param {Function} onSubmit - Función para enviar datos (debe venir del provider)
 * @param {Function} onSuccess - Función de callback de éxito (debe venir del provider)
 * @param {Function} showMessage - Función para mostrar mensajes (debe venir del provider o página)
 * @returns {Object} Objeto con resolveOptions, handleFinish, handleSave, minAge
 */
export const useStudentRegisterLogic = (contextData, minAge, onSubmit, onSuccess, showMessage) => {

  const {
    expediciones = [],
    generos = [],
    paises = [],
    idiomas = [],
    estadosCiviles = [],
    tiposSangre = [],
    discapacidades = [],
    gradosDiscapacidad = [],
    tiposOrigen = [],
  } = contextData || {};

  // Función para resolver opciones de campos select
  // Usa mappers centralizados para transformar datos del contexto a opciones de formulario
  // SOLID: Usa Strategy Pattern para mapear diferentes tipos de datos
  const resolveOptions = useMemo(() => {
    return (key) => {
      const dataMap = {
        expediciones,
        generos,
        paises,
        idiomas,
        estadosCiviles,
        tiposSangre,
        discapacidades,
        gradosDiscapacidad,
        tiposOrigen,
      };

      const data = dataMap[key];
      if (!data) {
        return [];
      }

      return transformToOptions(key, data);
    };
  }, [expediciones, generos, paises, idiomas, estadosCiviles, tiposSangre, discapacidades, gradosDiscapacidad, tiposOrigen]);

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
    resolveOptions,
    handleFinish,
    handleSave,
    minAge,
  };
};

