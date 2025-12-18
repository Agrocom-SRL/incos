/**
 * Punto de entrada del contenedor de Dependency Injection
 * Re-exporta el container configurado con todos los módulos registrados
 *
 * Uso:
 * import container from '../../infrastructure/container/index.js';
 */
export { default as container } from './modules/index.js';
export { default } from './modules/index.js';
