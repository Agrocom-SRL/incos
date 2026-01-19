/**
 * Application Utils - Barrel Export
 * 
 * Single Responsibility: Re-exportar todas las utilidades genéricas de la capa de aplicación
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades compartidas entre módulos de aplicación
 * 
 * Este index.js es el punto de entrada principal para todas las utilidades.
 * Permite importar desde @application/utils sin especificar la subcarpeta.
 * 
 * Organización por categoría:
 * - error: Manejo de errores (normalización, extracción, etc.)
 * - formatters: Formateo de datos para presentación (nombres, CI, etc.)
 * - hooks: Hooks genéricos compartidos (useMessage, useEnrichWizardSteps, createApiHook, etc.)
 * - state: Helpers para optimización de estado en React (setters optimizados, etc.)
 * - transformers: Transformadores genéricos (opciones, filtros, respuestas, etc.)
 * 
 * Ejemplo de uso:
 * ```javascript
 * // Importar desde el nivel general
 * import { 
 *   buildFullName, 
 *   buildCompleteCI, 
 *   useMessage, 
 *   transformToOptions, 
 *   excludeByField,
 *   createOptimizedArraySetter,
 *   useStableApiResult
 * } from '@application/utils';
 * 
 * // También puedes importar desde el nivel específico
 * import { useMessage } from '@application/utils/hooks';
 * import { buildFullName } from '@application/utils/formatters';
 * ```
 * 
 * Patrón: Barrel Export (re-exportación)
 * - Permite importar desde el nivel general o específico
 * - Facilita la organización y escalabilidad
 * - Mantiene la consistencia en toda la aplicación
 */

// ============================================================================
// Error Handling
// ============================================================================
export * from './error';

// ============================================================================
// Formatters
// ============================================================================
export * from './formatters';

// ============================================================================
// Hooks
// ============================================================================
export * from './hooks';

// ============================================================================
// State Optimization (Helpers)
// ============================================================================
export * from './state';

// ============================================================================
// Transformers
// ============================================================================
export * from './transformers';

// ============================================================================
// File Utilities
// ============================================================================
export { downloadFile } from './fileDownload';
