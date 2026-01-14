/**
 * State - Utilidades para optimización de estado en React
 * 
 * Single Responsibility: Re-exportar todas las utilidades de optimización de estado
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades genéricas para optimización de estado
 * 
 * Estos helpers permiten crear setters optimizados que solo actualizan el estado
 * cuando los datos realmente cambian, evitando renders innecesarios.
 * 
 * Organización:
 * - stateOptimization.js: Helpers para crear setters optimizados (array, object, primitive)
 * 
 * Ejemplo de uso:
 * ```javascript
 * import { createOptimizedArraySetter } from '@application/utils/state';
 * // o
 * import { createOptimizedArraySetter } from '@application/utils';
 * ```
 */

export * from './stateOptimization';
