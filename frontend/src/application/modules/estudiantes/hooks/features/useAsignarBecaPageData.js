/**
 * Hook: useAsignarBecaPageData
 * 
 * Single Responsibility: Gestionar todos los datos específicos de la página de asignar beca
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que maneja lógica específica de la página
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja datos de la página (título, breadcrumbs, handlers de navegación)
 * 
 * Este hook:
 * - Determina el título de la página (puede ser dinámico según parámetros)
 * - Genera los breadcrumb items basándose en el título
 * - Maneja handlers de navegación (handleVolver)
 * - Centraliza toda la lógica específica de la página
 * 
 * Usado por: AsignarBecaProvider (para exponer datos vía Context)
 */

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para obtener todos los datos específicos de la página de asignar beca
 * 
 * @param {Object} options - Opciones para personalizar el comportamiento
 * @param {string} options.studentName - Nombre del estudiante (opcional, para título dinámico)
 * @param {string|number} options.studentId - ID del estudiante (para navegación)
 * @returns {Object} Objeto con todos los datos de la página y handlers
 */
export const useAsignarBecaPageData = (options = {}) => {
    const { studentName, studentId } = options;
    const navigate = useNavigate();

    // Título de la página (puede ser dinámico según parámetros)
    const pageTitle = useMemo(() => {
        if (studentName) {
            return `Asignar Beca - ${studentName}`;
        }
        return 'Asignar Beca';
    }, [studentName]);

    // Breadcrumb items
    const breadcrumbItems = useMemo(() => [
        { title: 'Inicio', href: '/' },
        { title: 'Estudiantes', href: '/estudiantes' },
        { title: 'Asignar Beca' },
    ], []);

    // Handler para volver
    const handleVolver = useCallback(() => {
        if (studentId) {
            navigate(`/estudiantes/${studentId}`);
        } else {
            navigate('/estudiantes');
        }
    }, [studentId, navigate]);

    // Memoizar el objeto retornado para mantener referencia estable
    // Esto permite que el useMemo del Provider sea más efectivo
    return useMemo(() => {
        return {
            pageTitle,
            breadcrumbItems,
            handleVolver,
        };
    }, [pageTitle, breadcrumbItems, handleVolver]);
};
