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

import { useMemo, useEffect, useRef } from 'react';
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

    // Componer todos los datos del contexto
    const contextData = useMemo(() => ({
        ...catalogData,
        ...geographicData,
        ...referenceData,
    }), [catalogData, geographicData, referenceData]);

    // Hook especializado: transformar datos a opciones de formulario
    const resolveOptions = useStudentFormOptions(contextData);

    // Obtener documentación del catálogo (no de referenceData)
    const documentacion = catalogData.documentacion || [];

    // Ref para almacenar getFormValues (se actualizará después cuando se cree useStudentFormHandlers)
    // Esto resuelve la dependencia circular: useDocumentacionProcesada necesita getFormValues,
    // pero useStudentFormHandlers necesita documentacionProcesada
    const getFormValuesRef = useRef(() => ({}));

    // Hook compuesto: observar valores del formulario y procesar documentación
    // Usa getFormValuesRef.current para obtener valores del formulario
    const { documentacion: documentacionProcesada } = useDocumentacionProcesada(
      documentacion, 
      () => getFormValuesRef.current()
    );

    // Hook especializado: manejar handlers de submit y gestión del formulario
    // Este hook usa useRegisterStudent o useUpdateStudent según el modo
    // IMPORTANTE: Pasar documentacionProcesada para que getFormValues incluya todos los documentos
    const { handleFinish, handleSave, registerForm, getFormValues, formRef, loading, error, validationErrors, registrationResult } = useStudentFormHandlers(showMessage, mode, studentId, documentacionProcesada);
    
    // Actualizar el ref con la función real de getFormValues
    useEffect(() => {
      if (getFormValues) {
        getFormValuesRef.current = getFormValues;
      }
    }, [getFormValues]);

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
            handleFinish,
            handleSave,
            minAge: EDAD_MINIMA_REGISTRO,
            registerForm, // Expuesto desde useStudentFormHandlers
            // Estados del registro (expuestos desde useStudentFormHandlers)
            loading,
            error,
            validationErrors,
            registrationResult, // Resultado del registro para que la página pueda reaccionar
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
    }, [contextData, resolveOptions, handleFinish, handleSave, registerForm, loading, error, validationErrors, registrationResult, contactosIndices, agregarContacto, eliminarContacto, documentacionProcesada, referenceData.loadDiscapacidades, referenceData.loadTiposParentesco, geographicData.loadDepartamentos, geographicData.loadProvincias, geographicData.loadMunicipios]);

    return (
        <StudentRegisterContext.Provider value={value}>
            {children}
        </StudentRegisterContext.Provider>
    );
};

