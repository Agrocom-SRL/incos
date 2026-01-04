/**
 * Formatters - Utilidades de formateo de datos
 * 
 * Single Responsibility: Exportar todas las funciones de formateo
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades compartidas entre módulos
 * 
 * Este index.js permite importar desde:
 * - @application/utils/formatters (nivel específico)
 * - @application/utils (nivel general, re-exportado desde utils/index.js)
 * 
 * Ejemplo de uso:
 * import { buildFullName } from '@application/utils/formatters';
 * import { buildFullName } from '@application/utils'; // También funciona
 */
export {
  buildCompleteCI,
  buildFullName,
  buildPersonDisplayData,
} from './personFormatters';

