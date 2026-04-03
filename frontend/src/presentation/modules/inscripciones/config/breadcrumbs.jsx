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

import { createBreadcrumbItems as createGenericBreadcrumbItems } from '@presentation-utils/breadcrumbs';

export const createBreadcrumbItems = (routeKey, currentTitle = null) => {
  return createGenericBreadcrumbItems(
    routeKey,
    'MAT',
    currentTitle,
    null,
    'Matrícula'
  );
};

/**
 * Crea breadcrumb para la página de detalle de inscripción
 * 
 * @returns {Array} Array de items del breadcrumb
 */
export const createDetailBreadcrumbItems = () => {
  return createBreadcrumbItems('MAT-INS-DETALLE', 'Detalle de la Inscripción');
};
