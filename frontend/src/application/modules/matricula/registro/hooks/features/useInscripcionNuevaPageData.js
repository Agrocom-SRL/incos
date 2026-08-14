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

/**
 * Hook para obtener todos los datos específicos de la página de inscripción nueva
 *
 * Nota: los pasos del wizard NO se construyen aquí; salen de
 * useMatriculaWizardEnrichment (meta dinámica + enrichers).
 *
 * @param {Object} options - Opciones para personalizar el comportamiento
 * @param {string} options.mode - Modo de la página (puede ser 'nuevo', 'editar', etc.)
 * @returns {Object} Objeto con todos los datos de la página
 */
export const useInscripcionNuevaPageData = (options = {}) => {
    const { mode = 'nuevo' } = options;

    // Título de la página (puede ser dinámico según parámetros)
    const pageTitle = useMemo(() => {
        // Por ahora es estático, pero puede ser dinámico según mode u otros parámetros
        if (mode === 'editar') {
            return 'Editar inscripción';
        }
        return 'Inscribir estudiantes nuevos';
    }, [mode]);

    // Breadcrumb con jerarquía de dominio (Inicio / Matrícula / Registro de matrículas / <título>)
    const breadcrumbItems = useMemo(() => [
        { title: 'Inicio', href: '/' },
        { title: 'Matrícula' },
        { title: 'Registro de matrículas', href: '/matricula/listar' },
        { title: pageTitle },
    ], [pageTitle]);

    // Memoizar el objeto retornado para mantener referencia estable
    // Esto permite que el useMemo del Provider sea más efectivo
    return useMemo(() => {
        return {
            pageTitle,
            breadcrumbItems,
        };
    }, [pageTitle, breadcrumbItems]);
};
