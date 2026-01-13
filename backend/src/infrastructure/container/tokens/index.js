/**
 * Tokens de Inyección de Dependencias - Punto de entrada centralizado
 * 
 * Este archivo re-exporta todos los tokens modulares organizados por responsabilidad.
 * Cada módulo tiene su propio archivo de tokens que sigue el principio SRP.
 * 
 * Convenciones:
 * - Servicios base: camelCase (ej: 'logger', 'fileUploadService')
 * - Repositorios: camelCase + 'Repository' (ej: 'studentRepository')
 * - Use Cases: {modulo}.{action}{Entity}UseCase (ej: 'estudiantes.listStudentsUseCase')
 * - Controllers: {modulo}.{action}{Entity}Controller (ej: 'estudiantes.listStudentsController')
 * - Routers: {modulo}.{entity}Router (ej: 'estudiantes.estudiantesRouter')
 * 
 * Uso recomendado:
 * ```javascript
 * // Importar tokens específicos del módulo necesario
 * import { SERVICIOS_TOKENS } from './tokens/index.js';
 * import { ESTUDIANTES_TOKENS } from './tokens/index.js';
 * 
 * // O importar desde el archivo específico
 * import { SERVICIOS_TOKENS } from './tokens/servicios.tokens.js';
 * ```
 * 
 * Principio SOLID aplicado:
 * - SRP: Cada archivo de tokens maneja un solo módulo/responsabilidad
 * - OCP: Nuevos módulos agregan su archivo sin modificar existentes
 * - DIP: Los módulos dependen de abstracciones (tokens) no de implementaciones
 */

// Re-exportar todos los tokens modulares
export { SERVICIOS_TOKENS } from './servicios.tokens.js';
export { REPOSITORIOS_TOKENS } from './repositorios.tokens.js';
export { ESTUDIANTES_TOKENS } from './estudiantes.tokens.js';
export { CONFIGURACION_TOKENS } from './configuracion.tokens.js';
export { ACADEMICO_TOKENS } from './academico.tokens.js';
export { GEOGRAFICOS_TOKENS } from './geograficos.tokens.js';
export { REFERENCIA_TOKENS } from './referencia.tokens.js';

