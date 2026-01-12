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
import { useInscripcionNuevaPageData } from '@application-inscripciones/hooks';

export const InscripcionesNuevaProvider = ({ children, mode = 'nuevo' }) => {
    // Hook feature: maneja toda la lógica específica de la página (título, breadcrumbs, etc.)
    const pageData = useInscripcionNuevaPageData({ mode });
    
    // TODO: Aquí se agregarán los hooks de API y lógica en pasos siguientes
    // Por ahora, solo exponemos un estado básico
    
    // Componer el valor del contexto: datos + lógica + funciones de carga
    // El provider solo orquesta hooks y expone sus resultados
    const value = useMemo(() => ({
        // Estados básicos
        loading: false,
        error: null,
        
        // Datos de la página (título y breadcrumbs desde el hook feature)
        ...pageData,
        
        // TODO: Se agregarán en pasos siguientes:
        // - handleFinish: función para procesar el formulario completo
        // - handleSave: función para guardado parcial
        // - resolveOptions: función para resolver opciones de campos
        // - Datos del catálogo (carreras, materias, etc.)
        // - Funciones de carga bajo demanda
    }), [pageData]);

    return (
        <InscripcionesNuevaContext.Provider value={value}>
            {children}
        </InscripcionesNuevaContext.Provider>
    );
};
