/**
 * Provider: StudentRegisterProvider
 * 
 * Single Responsibility: Proporcionar estado compartido SOLO para la feature de registro de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de registro
 * - Solo carga y provee los datos necesarios para el formulario de registro
 * - Compone hooks especializados para exponer lógica del formulario
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo compone y expone datos/lógica vía Context
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * - Interface Segregation: Expone solo lo necesario para el formulario de registro
 * 
 * Ventajas:
 * - Aislamiento de errores: errores en lista no afectan el registro
 * - Performance: no carga miles de estudiantes cuando solo se necesita el formulario
 * - Separación de responsabilidades: cada feature tiene su propio provider
 * - Hooks especializados: mejor testabilidad y mantenibilidad
 * 
 * Estrategia:
 * - Usa hooks de API para cargar datos (useStudentCatalogApi, etc.)
 * - Usa hooks especializados para lógica (useStudentFormOptions, useStudentFormHandlers)
 * - Usa hook genérico compartido para mensajes (useMessage)
 * - Expone datos + lógica vía StudentRegisterContext
 */

import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import {
    useStudentCatalogApi,
    useStudentGeographicApi,
    useStudentReferenceApi,
    useStudentFormOptions,
    useStudentFormHandlers,
    useDocumentacionProcesada,
    useContactosEmergenciaDinamicos,
} from '@application-estudiantes/hooks';
import { useMessage } from '@application/utils';
import { StudentRegisterContext } from '@application-estudiantes/context/StudentRegisterContext';
import { EDAD_MINIMA_REGISTRO } from '@infrastructure/config/constants/studentConstants';
import { useCarrerasApi } from '@application-configuracion/academico/carreras/hooks/useCarrerasApi';
import { useGestionesApi } from '@application-estudiantes/hooks/api/useGestionesApi';

export const StudentRegisterProvider = ({ children, mode = 'create', studentId = null }) => {
    // Hook genérico compartido para mostrar mensajes
    const showMessage = useMessage();

    // Hook para catálogos esenciales del formulario de registro
    // Pasar el modo para que pueda ajustar la carga si es necesario
    const catalogData = useStudentCatalogApi(mode === 'edit' ? 300 : 0); // Delay de 300ms en modo edición

    // Hook para datos geográficos condicionales (carga bajo demanda)
    const geographicData = useStudentGeographicApi();

    // Hook para datos de referencia condicionales (carga bajo demanda)
    const referenceData = useStudentReferenceApi();

    // Cargar tipos de parentesco al inicializar (siempre se necesitan para contacto de emergencia)
    // En modo edición, esperar un poco para evitar llamadas paralelas con StudentDetailProvider
    useEffect(() => {
        if (referenceData.loadTiposParentesco && typeof referenceData.loadTiposParentesco === 'function') {
            // En modo edición, esperar 200ms para que primero se cargue el estudiante
            // Esto evita problemas de concurrencia en el servidor con múltiples llamadas simultáneas
            if (mode === 'edit') {
                const timeoutId = setTimeout(() => {
                    referenceData.loadTiposParentesco();
                }, 200);
                return () => clearTimeout(timeoutId);
            } else {
                // En modo creación, cargar inmediatamente
                referenceData.loadTiposParentesco();
            }
        }
    }, [referenceData.loadTiposParentesco, mode]);

    // Hook para gestiones académicas
    // Por defecto NO carga gestiones (estudiantes nuevos no necesitan gestiones)
    // Solo se carga cuando el tipo de admisión es ANTIGUO (gestiones no vigentes)
    const gestionesApi = useGestionesApi({ vigente: false, autoFetch: false });
    const gestiones = gestionesApi.gestiones || [];
    const gestionesLoading = gestionesApi.loading || false;
    const gestionesError = gestionesApi.error || null;
    
    // Función para cargar gestiones (cuando tipo es ANTIGUO; vigente lo resuelve el repositorio)
    const cargarGestiones = useCallback(() => {
      gestionesApi.fetch({ params: { vigente: 0 } });
    }, [gestionesApi.fetch]);

    // Hook para cargar carreras académicas
    const carrerasApi = useCarrerasApi();
    const carreras = carrerasApi.carreras || [];
    const carrerasLoading = carrerasApi.loading || false;
    const carrerasError = carrerasApi.error || null;

    // Componer todos los datos del contexto
    const contextData = useMemo(() => ({
        ...catalogData,
        ...geographicData,
        ...referenceData,
        gestiones, // Gestiones académicas (solo se cargan cuando tipo es ANTIGUO, gestiones no vigentes)
        carreras, // Carreras académicas
    }), [catalogData, geographicData, referenceData, gestiones, carreras]);

    // Hook especializado: transformar datos a opciones de formulario
    const resolveOptions = useStudentFormOptions(contextData);

    // Obtener documentación del catálogo (no de referenceData)
    const documentacion = catalogData.documentacion || [];

    // Hook especializado: manejar handlers de submit y gestión del formulario
    // Este hook usa useRegisterStudent o useUpdateStudent según el modo
    // IMPORTANTE: Inicialmente pasamos array vacío, pero useStudentFormHandlers usa un ref interno
    // que se actualizará cuando documentacionProcesada esté disponible
    const { handleFinish, handleSave, registerForm, getFormValues, formRef, loading, error, validationErrors, registrationResult } = useStudentFormHandlers(showMessage, mode, studentId, []);

    // Hook compuesto: procesar documentación sin observar valores del formulario
    // NO observa valores en tiempo real - solo procesa con valores por defecto
    // Los valores reales se capturan solo al finalizar el registro en getFormValues
    // Esto evita completamente la lentitud en campos de texto
    const { documentacion: documentacionProcesada } = useDocumentacionProcesada(
      documentacion, 
      formRef // Se pasa pero no se usa para observación
    );
    
    // NOTA: useStudentFormHandlers se llama con array vacío inicialmente, pero tiene un ref interno
    // que se actualiza cuando documentacionProcesada cambia. Sin embargo, como se pasa como parámetro
    // vacío, el useEffect interno no se ejecutará cuando documentacionProcesada esté disponible.
    // Para solucionar esto, pasamos documentacionProcesada directamente cuando esté disponible.
    // Como los hooks se ejecutan en orden, usamos documentacionProcesada directamente si está disponible.
    const { handleFinish: handleFinishFinal, handleSave: handleSaveFinal, registerForm: registerFormFinal, getFormValues: getFormValuesFinal, saveStep0Values: saveStep0ValuesFinal, getStep0Values: getStep0ValuesFinal, formRef: formRefFinal, loading: loadingFinal, error: errorFinal, validationErrors: validationErrorsFinal, registrationResult: registrationResultFinal } = useStudentFormHandlers(showMessage, mode, studentId, documentacionProcesada || []);
    
    // Usar los handlers finales (que incluyen documentacionProcesada cuando esté disponible)
    const finalHandlers = {
      handleFinish: handleFinishFinal,
      handleSave: handleSaveFinal,
      registerForm: registerFormFinal,
      getFormValues: getFormValuesFinal,
      saveStep0Values: saveStep0ValuesFinal,
      getStep0Values: getStep0ValuesFinal,
      formRef: formRefFinal,
      loading: loadingFinal,
      error: errorFinal,
      validationErrors: validationErrorsFinal,
      registrationResult: registrationResultFinal,
    };

    // Hook para manejar el estado de contactos de emergencia dinámicos
    const { contactosIndices, agregarContacto, eliminarContacto } = useContactosEmergenciaDinamicos();

    // MANTENER REFERENCIA ESTABLE DEL CONTEXTO
    // Comparar valores, no solo referencias, para evitar recálculos innecesarios
    const prevValueRef = useRef(null);
    
    // Componer el valor del contexto: datos + lógica + funciones de carga
    // El provider solo orquesta hooks y expone sus resultados
    const value = useMemo(() => {
        const current = {
            ...contextData,
            resolveOptions,
            handleFinish: finalHandlers.handleFinish,
            handleSave: finalHandlers.handleSave,
            minAge: EDAD_MINIMA_REGISTRO,
            registerForm: finalHandlers.registerForm, // Expuesto desde useStudentFormHandlers
            saveStep0Values: finalHandlers.saveStep0Values, // Preservar valores del paso 0 al cambiar de paso
            getStep0Values: finalHandlers.getStep0Values, // Valores preservados del paso 0 (para restaurar al volver)
            // Estados del registro (expuestos desde useStudentFormHandlers)
            loading: finalHandlers.loading,
            error: finalHandlers.error,
            validationErrors: finalHandlers.validationErrors,
            registrationResult: finalHandlers.registrationResult, // Resultado del registro para que la página pueda reaccionar
            // Contactos de emergencia dinámicos
            contactosIndices,
            agregarContacto,
            eliminarContacto,
            // Documentación procesada
            documentacionProcesada,
            // Exponer funciones de carga bajo demanda
            loadDiscapacidades: referenceData.loadDiscapacidades,
            loadTiposParentesco: referenceData.loadTiposParentesco,
            loadDepartamentos: geographicData.loadDepartamentos,
            loadProvincias: geographicData.loadProvincias,
            loadMunicipios: geographicData.loadMunicipios,
            // Estados de carreras y gestiones para componentes visuales
            carrerasLoading,
            gestionesLoading,
            carrerasError,
            gestionesError,
            // Función para cargar gestiones (cuando tipo es ANTIGUO)
            cargarGestiones,
        };

        const prev = prevValueRef.current;
        
        // Comparar valores clave, no solo referencias
        if (prev &&
            prev.loading === current.loading &&
            prev.error === current.error &&
            prev.validationErrors === current.validationErrors &&
            prev.registrationResult === current.registrationResult &&
            prev.minAge === current.minAge &&
            prev.resolveOptions === current.resolveOptions &&
            prev.handleFinish === current.handleFinish &&
            prev.handleSave === current.handleSave &&
            prev.registerForm === current.registerForm &&
            prev.saveStep0Values === current.saveStep0Values &&
            prev.getStep0Values === current.getStep0Values &&
            prev.contactosIndices === current.contactosIndices &&
            prev.agregarContacto === current.agregarContacto &&
            prev.eliminarContacto === current.eliminarContacto &&
            prev.documentacionProcesada === current.documentacionProcesada &&
            prev.loadDiscapacidades === current.loadDiscapacidades &&
            prev.loadTiposParentesco === current.loadTiposParentesco &&
            prev.loadDepartamentos === current.loadDepartamentos &&
            prev.loadProvincias === current.loadProvincias &&
            prev.loadMunicipios === current.loadMunicipios &&
            prev.contextData === current.contextData) {
            return prev;
        }

        prevValueRef.current = current;
        return current;
    }, [contextData, resolveOptions, finalHandlers, contactosIndices, agregarContacto, eliminarContacto, documentacionProcesada, referenceData.loadDiscapacidades, referenceData.loadTiposParentesco, geographicData.loadDepartamentos, geographicData.loadProvincias, geographicData.loadMunicipios]);

    return (
        <StudentRegisterContext.Provider value={value}>
            {children}
        </StudentRegisterContext.Provider>
    );
};

