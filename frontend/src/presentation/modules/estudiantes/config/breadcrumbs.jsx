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

import { createBreadcrumbItems as createGenericBreadcrumbItems } from '@presentation-utils/breadcrumbs';

/**
 * @param {string} routeKey
 * @param {string} currentTitle
 */
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
 * Crea breadcrumb para la página de lista de estudiantes
 * 
 * @returns {Array} Array de items del breadcrumb
 */
export const createListBreadcrumbItems = () => {
  return createBreadcrumbItems('MAT-ADM-LISTAR');
};

/**
 * Crea breadcrumb para la página de registro/edición de estudiante
 * 
 * @param {string} title - Título de la página (ej: 'Registrar Nuevo Estudiante', 'Editar Estudiante')
 * @returns {Array} Array de items del breadcrumb
 */
export const createRegisterBreadcrumbItems = (title) => {
  return createBreadcrumbItems('MAT-ADM-NUEVA', title);
};

/**
 * Crea breadcrumb para la página de detalle de estudiante
 * 
 * @returns {Array} Array de items del breadcrumb
 */
export const createDetailBreadcrumbItems = () => {
  return createBreadcrumbItems('MAT-ADM-DETALLE', 'Detalle del Estudiante');
};

/**
 * Crea breadcrumb para la página de asignar beca
 * 
 * @returns {Array} Array de items del breadcrumb
 */
export const createAsignarBecaBreadcrumbItems = () => {
  return createBreadcrumbItems('MAT-BEC-ASIGNAR', 'Asignar Beca');
};

