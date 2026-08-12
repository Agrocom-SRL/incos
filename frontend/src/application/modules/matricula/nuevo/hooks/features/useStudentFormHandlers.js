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
import { useRegisterStudent } from '../api/useRegisterStudent';
import { useUpdateStudent } from '../api/useUpdateStudent';

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

  // Ref para preservar valores del paso 0 (tipo admisión, gestión, carrera).
  // El wizard solo renderiza el paso actual; al cambiar de paso los Form.Item del paso 0
  // se desmontan y Ant Design elimina sus valores del store. Al enviar desde el último paso
  // getFieldsValue() no incluiría tipoAdmision, gestionIngresoId, carreraId si no los preservamos.
  const step0ValuesRef = useRef({});
  
  // Actualizar ref cuando documentacionProcesada cambie
  useEffect(() => {
    documentacionProcesadaRef.current = documentacionProcesada;
  }, [documentacionProcesada]);

  /** Guarda los valores del paso 0 para usarlos en getFormValues cuando el usuario ya está en otro paso. */
  const saveStep0Values = useCallback((values) => {
    if (values && typeof values === 'object') {
      step0ValuesRef.current = {
        tipoAdmision: values.tipoAdmision,
        gestionIngresoId: values.gestionIngresoId,
        carreraId: values.carreraId,
      };
    }
  }, []);

  /** Devuelve los valores preservados del paso 0 (para restaurar en el formulario al volver al paso 0). */
  const getStep0Values = useCallback(() => step0ValuesRef.current, []);

  // Función para obtener los valores del formulario
  // IMPORTANTE: Incluye todos los documentos con valores por defecto si no están presentes
  // Esto asegura que todos los documentos se envíen al backend, incluso si el usuario no interactuó con ellos
  // También restaura tipoAdmision, gestionIngresoId, carreraId del paso 0 si ya no están en el store (pasos posteriores)
  const getFormValues = useCallback(() => {
    if (!formRef.current) {
      console.warn('⚠️ El formulario no está registrado aún');
      return {};
    }
    try {
      // Obtener todos los valores del formulario (incluye campos no renderizados)
      const formValues = formRef.current.getFieldsValue(true);

      // Mantener la ref del paso 0 actualizada: si el form tiene algún valor del paso 0, guardarlo
      // (así no se pierde si el usuario hace "Guardar" en paso 0 o si el store aún los tiene al avanzar)
      const step0Current = step0ValuesRef.current;
      const hasStep0InForm = formValues.tipoAdmision !== undefined || formValues.gestionIngresoId !== undefined || formValues.carreraId !== undefined;
      if (hasStep0InForm) {
        step0ValuesRef.current = {
          tipoAdmision: formValues.tipoAdmision ?? step0Current?.tipoAdmision,
          gestionIngresoId: formValues.gestionIngresoId ?? step0Current?.gestionIngresoId,
          carreraId: formValues.carreraId ?? step0Current?.carreraId,
        };
      }

      // Restaurar valores del paso 0 si no están en el store (el usuario está en un paso posterior y los campos están desmontados)
      const step0 = step0ValuesRef.current;
      if (step0 && Object.keys(step0).length > 0) {
        if (formValues.tipoAdmision === undefined || formValues.tipoAdmision === null) formValues.tipoAdmision = step0.tipoAdmision;
        if (formValues.gestionIngresoId === undefined || formValues.gestionIngresoId === null) formValues.gestionIngresoId = step0.gestionIngresoId;
        if (formValues.carreraId === undefined || formValues.carreraId === null) formValues.carreraId = step0.carreraId;
      }
      // Si tenemos gestión/carrera pero tipoAdmision sigue vacío, inferir ANTIGUO (evita enviar NUEVO por error)
      if ((formValues.gestionIngresoId != null && formValues.gestionIngresoId !== '') || (formValues.carreraId != null && formValues.carreraId !== '')) {
        if (formValues.tipoAdmision === undefined || formValues.tipoAdmision === null || formValues.tipoAdmision === '') {
          formValues.tipoAdmision = 'ANTIGUO';
        }
      }
      // Fallback final: si tipoAdmision sigue sin valor (p. ej. nunca se llamó saveStep0Values), enviar NUEVO
      if (formValues.tipoAdmision === undefined || formValues.tipoAdmision === null || formValues.tipoAdmision === '') {
        formValues.tipoAdmision = 'NUEVO';
      }

      // Asegurar que todos los documentos estén presentes con valores por defecto
      // TRASPASO: no marcar documentos como entregados por defecto (entregado: false).
      // Resto de tipos: por defecto entregado: true.
      const tipoAdmision = formValues.tipoAdmision || 'NUEVO';
      const defaultEntregado = tipoAdmision === 'TRASPASO' ? false : true;
      const documentacionProcesada = documentacionProcesadaRef.current;
      if (documentacionProcesada && Array.isArray(documentacionProcesada) && documentacionProcesada.length > 0) {
        // Inicializar documentacion si no existe
        if (!formValues.documentacion) {
          formValues.documentacion = {};
        }
        
        // Función helper para normalizar observaciones (convertir string vacío a null)
        const normalizeObservaciones = (value) => {
          if (value === null || value === undefined) {
            return null;
          }
          if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed === '' ? null : trimmed;
          }
          return value;
        };
        
        // Para cada documento procesado, asegurar que esté presente
        documentacionProcesada.forEach((documento) => {
          const docKey = `doc_${documento.id}`;
          const docDefaultEntregado = documento.entregado !== undefined ? documento.entregado : defaultEntregado;
          
          // Si el documento no está presente en formValues, agregarlo con valores por defecto
          if (!formValues.documentacion[docKey]) {
            formValues.documentacion[docKey] = {
              entregado: docDefaultEntregado,
              en_tramite: documento.en_tramite !== undefined ? documento.en_tramite : false,
              observaciones: normalizeObservaciones(documento.observaciones),
            };
          } else {
            // Si el documento está presente pero no tiene entregado, usar el valor por defecto
            if (formValues.documentacion[docKey].entregado === undefined) {
              formValues.documentacion[docKey].entregado = docDefaultEntregado;
            }
            // Asegurar que en_tramite tenga un valor por defecto si no está presente
            if (formValues.documentacion[docKey].en_tramite === undefined) {
              formValues.documentacion[docKey].en_tramite = documento.en_tramite !== undefined ? documento.en_tramite : false;
            }
            // Normalizar observaciones: convertir string vacío a null para cumplir con el validador del backend
            formValues.documentacion[docKey].observaciones = normalizeObservaciones(formValues.documentacion[docKey].observaciones);
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
    saveStep0Values, // Preservar valores del paso 0 (tipoAdmision, gestionIngresoId, carreraId) al cambiar de paso
    getStep0Values, // Valores preservados del paso 0 (para restaurar al volver al paso 0)
    formRef, // Exponer formRef para que useDocumentacionProcesada pueda usar Form.useWatch
    // Estados del registro (expuestos desde useRegisterStudent)
    loading,
    error,
    validationErrors,
    // Resultado del registro (para que la página pueda reaccionar)
    registrationResult,
  };
};

