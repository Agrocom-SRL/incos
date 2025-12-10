/**
 * Registro centralizado de todos los módulos
 * Cada módulo registra sus propias dependencias
 */
import { Container } from '../Container.js';
import { logger } from '../../../config/logger.js';
import { registerEstudiantesModule } from './estudiantes.container.js';

// Crear instancia del contenedor
export const container = new Container();

// Registrar logger global
container.register('logger', () => logger, true);

// Registrar todos los módulos
const modules = [
  { name: 'Estudiantes', register: registerEstudiantesModule },
  // Aquí se agregarán más módulos:
  // { name: 'Inscripciones', register: registerInscripcionesModule },
  // { name: 'Calificaciones', register: registerCalificacionesModule },
  // etc...
];

modules.forEach((module) => {
  try {
    module.register(container);
    logger.info(`Módulo '${module.name}' registrado en el contenedor de DI`);
  } catch (error) {
    logger.error(`Error al registrar módulo '${module.name}':`, error);
  }
});

export default container;
export { container };
