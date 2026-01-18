/**
 * breadcrumbs - Configuración de breadcrumbs para el módulo de inscripciones
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

import { inscripcionesRoutes } from '@inscripciones/routes';
import { createBreadcrumbItems as createGenericBreadcrumbItems } from '@presentation-utils/breadcrumbs';

/**
 * Crea los items del breadcrumb basándose en la ruta actual
 * 
 * @param {string} routeKey - Key de la ruta (ej: 'INS', 'INS-CREATE', 'INS-DETALLE')
 * @param {string} currentTitle - Título actual de la página (para el último item del breadcrumb)
 * @returns {Array} Array de items del breadcrumb para Ant Design
 */
export const createBreadcrumbItems = (routeKey, currentTitle = null) => {
  return createGenericBreadcrumbItems(
    inscripcionesRoutes,
    routeKey,
    'INS', // rootKey
    currentTitle,
    null, // fallbackIcon (usa el del módulo)
    'Inscripciones' // fallbackLabel
  );
};

/**
 * Crea breadcrumb para la página de detalle de inscripción
 * 
 * @returns {Array} Array de items del breadcrumb
 */
export const createDetailBreadcrumbItems = () => {
  return createBreadcrumbItems('INS-DETALLE', 'Detalle de la Inscripción');
};
