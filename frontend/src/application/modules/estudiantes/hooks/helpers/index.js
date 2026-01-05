/**
 * Helpers para hooks del módulo de estudiantes
 * 
 * Single Responsibility: Exportar helpers compartidos entre hooks
 * 
 * Clean Architecture:
 * - Application Layer: Helpers específicos para hooks del módulo
 * 
 * Diferencia con utils/:
 * - utils/ → Utilidades generales del módulo (usadas por hooks, providers, componentes, etc.)
 * - helpers/ → Helpers específicos para hooks (solo usados por hooks)
 */

export * from './geographicFieldHelpers';
export * from './documentacionHelpers';

