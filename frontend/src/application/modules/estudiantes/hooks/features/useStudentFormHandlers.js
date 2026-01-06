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
 * - Dependency Inversion: Depende de funciones inyectadas (onSubmit, onSuccess, showMessage)
 * - Interface Segregation: Expone solo los handlers y funciones necesarios
 * 
 * Este hook:
 * - Gestiona el registro de la instancia del formulario
 * - Procesa handlers de submit (handleFinish, handleSave)
 * - Maneja mensajes y notificaciones
 * - Gestiona callbacks de éxito
 * - Imprime datos del formulario para debugging
 * 
 * Usado por: StudentRegisterProvider (para exponer handlers vía Context)
 */

import { useCallback, useRef } from 'react';

/**
 * Hook para gestionar handlers de submit del formulario de registro
 * 
 * @param {Function} onSubmit - Función para enviar datos (debe venir del provider)
 * @param {Function} onSuccess - Función de callback de éxito (debe venir del provider)
 * @param {Function} showMessage - Función para mostrar mensajes (debe venir del provider)
 * @returns {Object} Objeto con handleFinish, handleSave, registerForm y getFormValues
 */
export const useStudentFormHandlers = (onSubmit, onSuccess, showMessage) => {
  // Ref para almacenar la instancia del formulario
  const formRef = useRef(null);

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
  // Helper function to print form data
  const imprimirDatosFormulario = useCallback((accion) => {
    if (!getFormValues) {
      console.warn('⚠️ No se puede obtener los valores del formulario. getFormValues no está definido.');
      return;
    }

    try {
      const formValues = getFormValues();

      console.log('========================================');
      console.log(`📋 DATOS DEL FORMULARIO - ${accion}`);
      console.log('========================================');
      console.log(JSON.stringify(formValues, null, 2));
      console.log('========================================');
      console.log('📊 DATOS DESGLOSADOS POR SECCIÓN:');
      console.log('========================================');

      const datosDesglosados = {
        datosPersonales: {},
        datosGeograficos: {},
        datosAcademico: {},
        contactoEmergencia: {},
        documentacion: {},
        otros: {}
      };

      // Procesar datos del formulario
      Object.keys(formValues).forEach(key => {
        // Manejar arrays multidimensionales (contactosEmergencia, documentacion)
        if (Array.isArray(key)) {
          const [root, index, fieldName] = key;
          
          if (root === 'contactosEmergencia') {
            // Contactos de emergencia: contactosEmergencia[index][fieldName]
            if (!datosDesglosados.contactoEmergencia[root]) {
              datosDesglosados.contactoEmergencia[root] = [];
            }
            if (!datosDesglosados.contactoEmergencia[root][index]) {
              datosDesglosados.contactoEmergencia[root][index] = {};
            }
            datosDesglosados.contactoEmergencia[root][index][fieldName] = formValues[key];
          } else if (root === 'documentacion') {
            // Documentación: documentacion[id][fieldName]
            if (!datosDesglosados.documentacion[root]) {
              datosDesglosados.documentacion[root] = {};
            }
            if (!datosDesglosados.documentacion[root][index]) {
              datosDesglosados.documentacion[root][index] = {};
            }
            datosDesglosados.documentacion[root][index][fieldName] = formValues[key];
          } else {
            datosDesglosados.otros[String(key)] = formValues[key];
          }
        } else if (key.startsWith('nombre') || key.startsWith('apellido') || key.startsWith('fechaNacimiento') ||
          key.startsWith('ci') || key.startsWith('genero') || key.startsWith('estadoCivil') ||
          key.startsWith('telefono') || key.startsWith('email') || key.startsWith('tieneDiscapacidad') ||
          key.startsWith('tipoDiscapacidad') || key.startsWith('idioma')) {
          datosDesglosados.datosPersonales[key] = formValues[key];
        } else if (key.startsWith('pais') || key.startsWith('departamento') || key.startsWith('provincia') ||
          key.startsWith('municipio') || key.startsWith('direccion') || key.startsWith('zona') ||
          key.startsWith('calle') || key.startsWith('numero')) {
          datosDesglosados.datosGeograficos[key] = formValues[key];
        } else if (key.startsWith('carrera') || key.startsWith('gestion') || key.startsWith('periodo') ||
          key.startsWith('materia') || key.startsWith('turno')) {
          datosDesglosados.datosAcademico[key] = formValues[key];
        } else {
          datosDesglosados.otros[key] = formValues[key];
        }
      });

      // Imprimir datos desglosados
      Object.keys(datosDesglosados).forEach(seccion => {
        if (Object.keys(datosDesglosados[seccion]).length > 0) {
          console.log(`\n📁 ${seccion.toUpperCase()}:`);
          console.log(JSON.stringify(datosDesglosados[seccion], null, 2));
        }
      });

      console.log('\n========================================');
      console.log(`✅ Datos listos para ${accion.toLowerCase()}`);
      console.log('📦 Listo para enviar al backend');
      console.log('========================================\n');
    } catch (error) {
      console.error('❌ Error al obtener/imprimir los datos del formulario:', error);
    }
  }, [getFormValues]);

  // Handler para finalizar el registro
  const handleFinish = useCallback(async (step) => {
    console.log('🚀 handleFinish ejecutado - Step:', step);
    imprimirDatosFormulario('FINALIZAR REGISTRO');
    
    if (onSubmit) {
      const formValues = getFormValues ? getFormValues() : {};
      const result = await onSubmit(formValues, step, true, false);
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
    } else {
      console.warn('⚠️ onSubmit no está definido, solo se imprimirán los datos');
    }
  }, [onSubmit, onSuccess, showMessage, getFormValues, imprimirDatosFormulario]);

  // Handler para guardar parcialmente
  const handleSave = useCallback(async (step) => {
    console.log('💾 handleSave ejecutado - Step:', step);
    imprimirDatosFormulario('GUARDAR PARCIAL');
    
    if (onSubmit) {
      const formValues = getFormValues ? getFormValues() : {};
      const result = await onSubmit(formValues, step, false, true);
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
    } else {
      console.warn('⚠️ onSubmit no está definido, solo se imprimirán los datos');
    }
  }, [onSubmit, onSuccess, showMessage, getFormValues, imprimirDatosFormulario]);

  return {
    handleFinish,
    handleSave,
    registerForm,
    getFormValues,
  };
};

