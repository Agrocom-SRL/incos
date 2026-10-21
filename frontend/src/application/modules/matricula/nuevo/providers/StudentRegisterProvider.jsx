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

import { useMemo, useEffect, useCallback } from 'react';
import {
    useStudentCatalogApi,
    useStudentGeographicApi,
} from '@application-matricula/admision/hooks';
import { useMessage } from '@application/utils';
import { StudentRegisterContext } from '@application-matricula/nuevo/context/StudentRegisterContext';
import { EDAD_MINIMA_REGISTRO } from '@infrastructure/config/constants/studentConstants';
import { useCarrerasApi } from '@application-configuracion/academico/hooks';
import { useGestionesApi } from '@application-matricula/nuevo/hooks/api/useGestionesApi';
import { useStudentReferenceApi } from '@application-matricula/nuevo/hooks/api/useStudentReferenceApi';
import { useStudentFormOptions } from '@application-matricula/nuevo/hooks/features/useStudentFormOptions';
import { useStudentFormHandlers } from '@application-matricula/nuevo/hooks/features/useStudentFormHandlers';
import { useDocumentacionProcesada } from '@application-matricula/nuevo/hooks/features/useDocumentacionProcesada';
import { useContactosEmergenciaDinamicos } from '@application-matricula/nuevo/hooks/features/useContactosEmergenciaDinamicos';

// Referencia estable para valores por defecto (evita recrear dependencias en cada render)
const EMPTY_ARRAY = [];

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
    const { loadTiposParentesco, loadDiscapacidades } = referenceData;
    useEffect(() => {
        if (loadTiposParentesco && typeof loadTiposParentesco === 'function') {
            // En modo edición, esperar 200ms para que primero se cargue el estudiante
            // Esto evita problemas de concurrencia en el servidor con múltiples llamadas simultáneas
            if (mode === 'edit') {
                const timeoutId = setTimeout(() => {
                    loadTiposParentesco();
                }, 200);
                return () => clearTimeout(timeoutId);
            } else {
                // En modo creación, cargar inmediatamente
                loadTiposParentesco();
            }
        }
    }, [loadTiposParentesco, mode]);

    // Hook para gestiones académicas
    // Por defecto NO carga gestiones (estudiantes nuevos no necesitan gestiones)
    // La carga y el filtro (vigentes / no vigentes / todas) dependen del tipo de admisión
    const gestionesApi = useGestionesApi({ autoFetch: false });
    const gestiones = gestionesApi.gestiones || EMPTY_ARRAY;
    const gestionesLoading = gestionesApi.loading || false;
    const gestionesError = gestionesApi.error || null;
    
    // Función para cargar gestiones según el tipo de admisión
    // - ANTIGUO: solo gestiones no vigentes (pasadas)
    // - TRANSITABILIDAD / TRASPASO: todas las gestiones (incluye la vigente)
    const { fetch: fetchGestiones } = gestionesApi;
    const cargarGestiones = useCallback((tipoAdmision) => {
      if (!fetchGestiones) return;

      if (tipoAdmision === 'ANTIGUO') {
        fetchGestiones({ params: { vigente: 0 } });
        return;
      }

      if (tipoAdmision === 'TRANSITABILIDAD' || tipoAdmision === 'TRASPASO') {
        fetchGestiones(); // Sin filtro de vigente => todas las gestiones
      }
    }, [fetchGestiones]);

    // Hook para cargar carreras académicas
    const carrerasApi = useCarrerasApi();
    const carreras = carrerasApi.carreras || EMPTY_ARRAY;
    const carrerasLoading = carrerasApi.loading || false;
    const carrerasError = carrerasApi.error || null;

    // Componer todos los datos del contexto
    const contextData = useMemo(() => ({
        ...catalogData,
        ...geographicData,
        ...referenceData,
        gestiones, // Gestiones académicas (solo se cargan cuando tipo es ANTIGUO, gestiones no vigentes)
        carreras, // Carreras académicas
        instituciones: catalogData.instituciones || [], // Instituciones de origen (para paso Traspaso)
    }), [catalogData, geographicData, referenceData, gestiones, carreras]);

    // Hook especializado: transformar datos a opciones de formulario
    const resolveOptions = useStudentFormOptions(contextData);

    // Obtener documentación del catálogo (no de referenceData)
    const documentacion = catalogData.documentacion || EMPTY_ARRAY;
    const documentacionTraspaso = catalogData.documentacionTraspaso || EMPTY_ARRAY;

    // Hook especializado: manejar handlers de submit y gestión del formulario
    // Este hook usa useRegisterStudent o useUpdateStudent según el modo
    // IMPORTANTE: Inicialmente pasamos array vacío, pero useStudentFormHandlers usa un ref interno
    // que se actualizará cuando documentacionProcesada esté disponible
    const { formRef } = useStudentFormHandlers(showMessage, mode, studentId, []);

    // Hook compuesto: procesar documentación sin observar valores del formulario
    // NO observa valores en tiempo real - solo procesa con valores por defecto
    // Los valores reales se capturan solo al finalizar el registro en getFormValues
    // Esto evita completamente la lentitud en campos de texto
    const { documentacion: documentacionProcesada } = useDocumentacionProcesada(
      documentacion, 
      formRef // Se pasa pero no se usa para observación
    );
    const { documentacion: documentacionTraspasoProcesada } = useDocumentacionProcesada(
      documentacionTraspaso,
      formRef
    );

    // NOTA: useStudentFormHandlers se llama con array vacío inicialmente, pero tiene un ref interno
    // que se actualiza cuando documentacionProcesada cambia. Sin embargo, como se pasa como parámetro
    // vacío, el useEffect interno no se ejecutará cuando documentacionProcesada esté disponible.
    // Para solucionar esto, pasamos documentacionProcesada directamente cuando esté disponible.
    // Como los hooks se ejecutan en orden, usamos documentacionProcesada directamente si está disponible.
    // Handlers finales (incluyen documentacionProcesada cuando esté disponible)
    const { handleFinish, handleSave, registerForm, saveStep0Values, getStep0Values, loading, error, validationErrors, registrationResult } = useStudentFormHandlers(showMessage, mode, studentId, documentacionProcesada || []);
    
    // Hook para manejar el estado de contactos de emergencia dinámicos
    const { contactosIndices, agregarContacto, eliminarContacto } = useContactosEmergenciaDinamicos();

    // Componer el valor del contexto: datos + lógica + funciones de carga
    // El provider solo orquesta hooks y expone sus resultados
    // useMemo mantiene la referencia estable mientras no cambie ninguna dependencia
    const value = useMemo(() => ({
        ...contextData,
        resolveOptions,
        handleFinish,
        handleSave,
        minAge: EDAD_MINIMA_REGISTRO,
        registerForm, // Expuesto desde useStudentFormHandlers
        saveStep0Values, // Preservar valores del paso 0 al cambiar de paso
        getStep0Values, // Valores preservados del paso 0 (para restaurar al volver)
        // Estados del registro (expuestos desde useStudentFormHandlers)
        loading,
        error,
        validationErrors,
        registrationResult, // Resultado del registro para que la página pueda reaccionar
        // Contactos de emergencia dinámicos
        contactosIndices,
        agregarContacto,
        eliminarContacto,
        // Documentación procesada (INSCRIPCION y TRASPASO para step Documentación)
        documentacionProcesada,
        documentacionTraspasoProcesada,
        // Documentación raw del catálogo (para paso documentación con lógica padre-hijo dinámica)
        documentacionRaw: documentacion,
        documentacionTraspasoRaw: documentacionTraspaso,
        // Exponer funciones de carga bajo demanda
        loadDiscapacidades,
        loadTiposParentesco,
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
    }), [
        contextData,
        resolveOptions,
        handleFinish,
        handleSave,
        registerForm,
        saveStep0Values,
        getStep0Values,
        loading,
        error,
        validationErrors,
        registrationResult,
        contactosIndices,
        agregarContacto,
        eliminarContacto,
        documentacionProcesada,
        documentacionTraspasoProcesada,
        documentacion,
        documentacionTraspaso,
        loadDiscapacidades,
        loadTiposParentesco,
        geographicData.loadDepartamentos,
        geographicData.loadProvincias,
        geographicData.loadMunicipios,
        carrerasLoading,
        gestionesLoading,
        carrerasError,
        gestionesError,
        cargarGestiones,
    ]);

    return (
        <StudentRegisterContext.Provider value={value}>
            {children}
        </StudentRegisterContext.Provider>
    );
};

