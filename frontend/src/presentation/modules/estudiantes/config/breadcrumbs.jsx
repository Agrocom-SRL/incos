/**
 * breadcrumbs - Configuración de breadcrumbs para el módulo de estudiantes
 * 
 * Single Responsibility: Generar breadcrumbs específicos del módulo usando helpers genéricos
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (metadata de presentación)
 * - Usa helpers genéricos de presentation/utils/breadcrumbs
 * 
 * Este archivo es un wrapper específico del módulo que usa las funciones genéricas,
 * permitiendo personalización por módulo si es necesario.
 */

import { estudiantesRoutes } from '@estudiantes/routes';
import { createBreadcrumbItems as createGenericBreadcrumbItems } from '@presentation-utils/breadcrumbs';

/**
 * Crea los items del breadcrumb basándose en la ruta actual
 * 
 * @param {string} routeKey - Key de la ruta (ej: 'EST', 'EST-REGISTRAR', 'EST-LIST')
 * @param {string} currentTitle - Título actual de la página (para el último item del breadcrumb)
 * @returns {Array} Array de items del breadcrumb para Ant Design
 */
export const createBreadcrumbItems = (routeKey, currentTitle = null) => {
  return createGenericBreadcrumbItems(
    estudiantesRoutes,
    routeKey,
    'EST', // rootKey
    currentTitle,
    null, // fallbackIcon (usa el del módulo)
    'Estudiantes' // fallbackLabel
  );
};

/**
 * Crea breadcrumb para la página de lista de estudiantes
 * 
 * @returns {Array} Array de items del breadcrumb
 */
export const createListBreadcrumbItems = () => {
  return createBreadcrumbItems('EST');
};

/**
 * Crea breadcrumb para la página de registro/edición de estudiante
 * 
 * @param {string} title - Título de la página (ej: 'Registrar Nuevo Estudiante', 'Editar Estudiante')
 * @returns {Array} Array de items del breadcrumb
 */
export const createRegisterBreadcrumbItems = (title) => {
  return createBreadcrumbItems('EST-REGISTRAR', title);
};

/**
 * Crea breadcrumb para la página de detalle de estudiante
 * 
 * @returns {Array} Array de items del breadcrumb
 */
export const createDetailBreadcrumbItems = () => {
  return [
    { title: 'Inicio', href: '/' },
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: 'Detalle del Estudiante' },
  ];
};

