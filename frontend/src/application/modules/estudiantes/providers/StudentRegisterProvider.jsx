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

import { useMemo, useEffect } from 'react';
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

export const StudentRegisterProvider = ({ children }) => {
    // Hook genérico compartido para mostrar mensajes
    const showMessage = useMessage();

    // Hook para catálogos esenciales del formulario de registro
    const catalogData = useStudentCatalogApi();

    // Hook para datos geográficos condicionales (carga bajo demanda)
    const geographicData = useStudentGeographicApi();

    // Hook para datos de referencia condicionales (carga bajo demanda)
    const referenceData = useStudentReferenceApi();

    // Cargar tipos de parentesco al inicializar (siempre se necesitan para contacto de emergencia)
    useEffect(() => {
        if (referenceData.loadTiposParentesco && typeof referenceData.loadTiposParentesco === 'function') {
            referenceData.loadTiposParentesco();
        }
    }, [referenceData.loadTiposParentesco]);

    // Componer todos los datos del contexto
    const contextData = useMemo(() => ({
        ...catalogData,
        ...geographicData,
        ...referenceData,
    }), [catalogData, geographicData, referenceData]);

    // TODO: Implementar onSubmit y onSuccess en hooks de API o use cases
    // Por ahora se dejan como undefined, se implementarán cuando se cree el use case de registro
    const onSubmit = undefined;
    const onSuccess = undefined;

    // Hook especializado: transformar datos a opciones de formulario
    const resolveOptions = useStudentFormOptions(contextData);

    // Hook especializado: manejar handlers de submit y gestión del formulario
    const { handleFinish, handleSave, registerForm, getFormValues } = useStudentFormHandlers(onSubmit, onSuccess, showMessage);

    // Hook para manejar el estado de contactos de emergencia dinámicos
    const { contactosIndices, agregarContacto, eliminarContacto } = useContactosEmergenciaDinamicos();

    // Obtener documentación del catálogo (no de referenceData)
    const documentacion = catalogData.documentacion || [];

    // Hook compuesto: observar valores del formulario y procesar documentación
    const { documentacion: documentacionProcesada } = useDocumentacionProcesada(documentacion, getFormValues);

    // Componer el valor del contexto: datos + lógica + funciones de carga
    // El provider solo orquesta hooks y expone sus resultados
    const value = useMemo(() => ({
        ...contextData,
        resolveOptions,
        handleFinish,
        handleSave,
        minAge: EDAD_MINIMA_REGISTRO,
        registerForm, // Expuesto desde useStudentFormHandlers
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
    }), [contextData, resolveOptions, handleFinish, handleSave, registerForm, contactosIndices, agregarContacto, eliminarContacto, documentacionProcesada, referenceData.loadDiscapacidades, referenceData.loadTiposParentesco, geographicData.loadDepartamentos, geographicData.loadProvincias, geographicData.loadMunicipios]);

    return (
        <StudentRegisterContext.Provider value={value}>
            {children}
        </StudentRegisterContext.Provider>
    );
};

