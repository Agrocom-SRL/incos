/**
 * Provider: InscripcionesNuevaProvider
 * 
 * Single Responsibility: Proporcionar estado compartido SOLO para la feature de inscripción de estudiantes nuevos
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de inscripción nueva
 * - Solo carga y provee los datos necesarios para el formulario de inscripción
 * - Compone hooks especializados para exponer lógica del formulario
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo compone y expone datos/lógica vía Context
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * - Interface Segregation: Expone solo lo necesario para el formulario de inscripción
 * 
 * Ventajas:
 * - Aislamiento de errores: errores en otras features no afectan la inscripción
 * - Performance: no carga datos innecesarios
 * - Separación de responsabilidades: cada feature tiene su propio provider
 * - Hooks especializados: mejor testabilidad y mantenibilidad
 * 
 * Estrategia:
 * - Usa hooks de API para cargar datos (se implementarán en pasos siguientes)
 * - Usa hooks especializados para lógica (se implementarán en pasos siguientes)
 * - Expone datos + lógica vía InscripcionesNuevaContext
 * 
 * Nota: Esta es una versión base que se irá completando por pasos
 */

import { useMemo } from 'react';
import { InscripcionesNuevaContext } from '@application-inscripciones/context/InscripcionesNuevaContext';
import { 
    useInscripcionNuevaPageData, 
    useInscripcionNuevaFormHandlers, 
    useInscripcionNuevaStudentSearch
} from '@application-inscripciones/hooks';
import { useEnrichWizardSteps } from '@application-utils/hooks';
import { studentEnrichers } from '@application-inscripciones/hooks/features/enrichers/studentEnrichers';

export const InscripcionesNuevaProvider = ({ children, mode = 'nuevo' }) => {
    // Hook feature: maneja toda la lógica específica de la página (título, breadcrumbs, wizardSteps, etc.)
    const pageData = useInscripcionNuevaPageData({ mode });
    
    // Hook especializado: manejar handlers de submit y gestión del formulario
    // El hook usa useMessage() internamente, no necesita pasarlo como parámetro
    const formHandlers = useInscripcionNuevaFormHandlers(mode);
    
    // Hook de búsqueda de estudiantes: encapsula la dependencia del módulo de estudiantes
    const studentSearch = useInscripcionNuevaStudentSearch();
    
    // Hook genérico: enriquecer wizardSteps de forma genérica y extensible
    // La lógica de enriquecimiento específica está en los enrichers, no en el hook
    // El hook solo orquesta la aplicación de los enrichers
    // 
    // Ventajas de este enfoque:
    // - Extensible: Agregar nuevos enrichers sin modificar el hook
    // - Testeable: Cada enricher se puede testear independientemente
    // - Mantenible: Lógica específica separada en archivos de enrichers
    // - Reutilizable: El hook genérico puede ser usado por cualquier módulo
    const enrichedWizardSteps = useEnrichWizardSteps(
        pageData.wizardSteps,
        studentEnrichers, // Array de funciones de enriquecimiento específicas de estudiantes
        {
            // Contexto con callbacks y datos disponibles para los enrichers
            onSearchStudent: studentSearch.searchStudent,
            studentSearch: studentSearch,
            // TODO: Agregar más contextos cuando se necesiten:
            // paralelosData: paralelosData,
            // horariosData: horariosData,
            // materiasData: materiasData,
        }
    );
    
    // Componer el valor del contexto: datos + lógica + funciones de carga
    // El provider solo orquesta hooks y expone sus resultados
    // 
    // Optimización: Usar objetos completos tanto en el cuerpo como en dependencias
    // - Más escalable: no necesitas actualizar cuando agregas propiedades
    // - Más mantenible: menos código repetitivo
    // - React compara por referencia, así que si el objeto cambia, se recalcula automáticamente
    const value = useMemo(() => ({
        // Datos de la página (spread de pageData, pero sobrescribimos wizardSteps con versión enriquecida)
        ...pageData,
        wizardSteps: enrichedWizardSteps, // Sobrescribir con versión enriquecida
        
        // Handlers y estados del formulario (spread completo de formHandlers)
        // Incluye: form, handleFinish, handleSave, getFormValues, loading, error, etc.
        ...formHandlers,
        
        // Búsqueda de estudiantes (exponer solo lo necesario del hook)
        studentSearch: {
            students: studentSearch.students,
            loading: studentSearch.loading,
            error: studentSearch.error,
        },
        
        // TODO: Se agregarán en pasos siguientes:
        // - Resolver opciones de campos (si se necesitan, usar enrichers)
        // - Datos del catálogo (carreras, materias, etc.)
        // - Funciones de carga bajo demanda
        // - Validaciones específicas
    }), [
        // Usar objetos completos: más escalable y mantenible
        pageData,           // Incluye pageTitle, breadcrumbItems, wizardSteps
        enrichedWizardSteps, // WizardSteps enriquecidos (sobrescribe pageData.wizardSteps)
        formHandlers,       // Incluye handleFinish, handleSave, registerForm, loading, error, etc.
        studentSearch,      // Incluye students, loading, error, searchStudent, refetch
    ]);

    return (
        <InscripcionesNuevaContext.Provider value={value}>
            {children}
        </InscripcionesNuevaContext.Provider>
    );
};
