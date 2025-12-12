/**
 * Punto de entrada del contenedor de Dependency Injection
 * Re-exporta el container configurado con todos los módulos registrados
 *
 * Uso:
 * import container from './shared/container/index.js';
 * const controller = container.resolve('estudiantes.createStudentController');
 */
export { default as container } from './modules/index.js';
export { default } from './modules/index.js';
