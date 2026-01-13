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
    useInscripcionNuevaStudentSearch,
    useInscripcionNuevaWizardSteps 
} from '@application-inscripciones/hooks';
import { useMessage } from '@application/utils';

export const InscripcionesNuevaProvider = ({ children, mode = 'nuevo' }) => {
    // Hook genérico compartido para mostrar mensajes
    const showMessage = useMessage();
    
    // Hook feature: maneja toda la lógica específica de la página (título, breadcrumbs, wizardSteps, etc.)
    const pageData = useInscripcionNuevaPageData({ mode });
    
    // Hook especializado: manejar handlers de submit y gestión del formulario
    const formHandlers = useInscripcionNuevaFormHandlers(showMessage, mode);
    
    // Hook de búsqueda de estudiantes: encapsula la dependencia del módulo de estudiantes
    const studentSearch = useInscripcionNuevaStudentSearch();
    
    // Hook de estado: enriquecer wizardSteps con callbacks dinámicos
    // La lógica de enriquecimiento está en el hook, no en el provider
    const enrichedWizardSteps = useInscripcionNuevaWizardSteps(pageData.wizardSteps, {
        onSearchStudent: studentSearch.searchStudent,
    });
    
    // Función para resolver opciones de campos (select, radio, etc.)
    // TODO: Crear hook especializado useInscripcionFormOptions cuando se necesite
    const resolveOptions = () => {
        // TODO: Implementar resolución de opciones según el campo
        return [];
    };
    
    // Componer el valor del contexto: datos + lógica + funciones de carga
    // El provider solo orquesta hooks y expone sus resultados
    const value = useMemo(() => ({
        // Datos de la página (título, breadcrumbs desde el hook feature)
        pageTitle: pageData.pageTitle,
        breadcrumbItems: pageData.breadcrumbItems,
        // WizardSteps enriquecidos con callbacks dinámicos
        wizardSteps: enrichedWizardSteps,
        
        // Handlers y estados del formulario (desde useInscripcionNuevaFormHandlers)
        ...formHandlers,
        
        // Búsqueda de estudiantes (desde useInscripcionNuevaStudentSearch)
        studentSearch: {
            students: studentSearch.students,
            loading: studentSearch.loading,
            error: studentSearch.error,
        },
        
        // Resolver opciones de campos
        resolveOptions,
        
        // TODO: Se agregarán en pasos siguientes:
        // - Datos del catálogo (carreras, materias, etc.)
        // - Funciones de carga bajo demanda
        // - Validaciones específicas
    }), [pageData.pageTitle, pageData.breadcrumbItems, enrichedWizardSteps, formHandlers, studentSearch, resolveOptions]);

    return (
        <InscripcionesNuevaContext.Provider value={value}>
            {children}
        </InscripcionesNuevaContext.Provider>
    );
};
