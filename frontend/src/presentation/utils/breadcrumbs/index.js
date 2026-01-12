/**
 * Breadcrumb Utils - Utilidades para generar breadcrumbs
 * 
 * Single Responsibility: Exportar todas las utilidades de breadcrumbs
 * 
 * Clean Architecture:
 * - Presentation Layer: Utilidades de UI (breadcrumbs son parte de la presentación)
 * 
 * Estas utilidades son genéricas y pueden ser usadas por cualquier módulo
 */

export { createBreadcrumbItems } from './breadcrumbUtils';
export { getModuleIcon, MODULE_ICONS } from './moduleIcons';
