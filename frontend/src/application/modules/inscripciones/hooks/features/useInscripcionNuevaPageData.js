/**
 * Hook: useInscripcionNuevaPageData
 * 
 * Single Responsibility: Gestionar todos los datos específicos de la página de inscripción nueva
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que maneja lógica específica de la página
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja datos de la página (título, breadcrumbs, etc.)
 * 
 * Este hook:
 * - Determina el título de la página (puede ser dinámico según parámetros)
 * - Genera los breadcrumb items basándose en el título
 * - Centraliza toda la lógica específica de la página
 * 
 * Usado por: InscripcionesNuevaProvider (para exponer datos vía Context)
 */

import { useMemo } from 'react';
import { createInscripcionNuevaWizardSteps } from '@inscripciones/config';
import { requiereHistorialPrevio } from '@application-inscripciones/utils/historialPrevioHelpers';

/**
 * Hook para obtener todos los datos específicos de la página de inscripción nueva
 * 
 * @param {Object} options - Opciones para personalizar el comportamiento
 * @param {string} options.mode - Modo de la página (puede ser 'nuevo', 'editar', etc.)
 * @returns {Object} Objeto con todos los datos de la página
 */
export const useInscripcionNuevaPageData = (options = {}) => {
    const { mode = 'nuevo', tipoAdmision = null } = options;

    // Título de la página (puede ser dinámico según parámetros)
    const pageTitle = useMemo(() => {
        // Por ahora es estático, pero puede ser dinámico según mode u otros parámetros
        if (mode === 'editar') {
            return 'Editar inscripción';
        }
        return 'Inscribir estudiantes nuevos';
    }, [mode]);

    // Breadcrumb items
    const breadcrumbItems = useMemo(() => [
        { title: 'Inicio', href: '/' },
        { title: 'Lista de matrículas', href: '/matricula/listar' },
        { title: pageTitle },
    ], [pageTitle]);

    // Configuración de steps del wizard
    const wizardSteps = useMemo(() => {
        return createInscripcionNuevaWizardSteps(requiereHistorialPrevio(tipoAdmision));
    }, [tipoAdmision]);

    // Memoizar el objeto retornado para mantener referencia estable
    // Esto permite que el useMemo del Provider sea más efectivo
    return useMemo(() => {
        return {
            pageTitle,
            breadcrumbItems,
            wizardSteps,
        };
    }, [pageTitle, breadcrumbItems, wizardSteps]);
};
