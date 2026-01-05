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

/**
 * Hook para gestionar la lógica del formulario de registro de estudiantes
 * 
 * @param {Object} contextData - Datos del contexto (expediciones, generos, paises, etc.)
 * @param {Function} onSubmit - Función para enviar datos (debe venir del provider)
 * @param {Function} onSuccess - Función de callback de éxito (debe venir del provider)
 * @param {Function} showMessage - Función para mostrar mensajes (debe venir del provider o página)
 * @returns {Object} Objeto con resolveOptions, handleFinish, handleSave
 */
export const useStudentRegisterLogic = (contextData, onSubmit, onSuccess, showMessage) => {

  const {
    expediciones = [],
    generos = [],
    paises = [],
    idiomas = [],
    estadosCiviles = [],
    tiposSangre = [],
  } = contextData || {};

  // Función para resolver opciones de campos select
  // Mapea strings como 'expediciones', 'generos' a los arrays de datos del contexto
  const resolveOptions = useMemo(() => {
    return (key) => {
      const optionsMap = {
        expediciones: expediciones.map(exp => ({
          label: exp.nombre || exp.label || exp,
          value: exp.id || exp.value || exp,
        })),
        generos: generos.map(gen => ({
          label: gen.nombre || gen.label || gen,
          value: gen.id || gen.value || gen,
        })),
        paises: paises.map(pais => ({
          label: pais.nombre || pais.label || pais,
          value: pais.id || pais.value || pais,
        })),
        idiomas: idiomas.map(idioma => ({
          label: idioma.nombre || idioma.label || idioma,
          value: idioma.id || idioma.value || idioma,
        })),
        estadosCiviles: estadosCiviles.map(ec => ({
          label: ec.nombre || ec.label || ec,
          value: ec.id || ec.value || ec,
        })),
        tiposSangre: tiposSangre.map(ts => ({
          label: ts.nombre || ts.label || ts,
          value: ts.id || ts.value || ts,
        })),
      };

      return optionsMap[key] || [];
    };
  }, [expediciones, generos, paises, idiomas, estadosCiviles, tiposSangre]);

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
  };
};

