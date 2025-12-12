/**
 * Configuración central del contenedor de Dependency Injection
 * Crea la instancia del container y registra todos los módulos de la aplicación
 *
 * Estructura:
 * - Container.js: Clase base del contenedor
 * - modules/*.container.js: Registradores de cada módulo funcional
 * - index.js (este archivo): Punto de configuración central
 */
import { Container } from '../Container.js';
import { logger } from '../../../config/logger.js';

// ============================================
// REGISTRADORES DE MÓDULOS
// ============================================
import { registerEstudiantesModule } from './estudiantes.container.js';
// TODO: Agregar más módulos cuando se implementen:
// import { registerInscripcionesModule } from './inscripciones.container.js';
// import { registerCalificacionesModule } from './calificaciones.container.js';
// import { registerAuthModule } from './auth.container.js';

// ============================================
// CREAR INSTANCIA DEL CONTENEDOR
// ============================================
export const container = new Container();

// ============================================
// SERVICIOS GLOBALES (compartidos por todos los módulos)
// ============================================
container.register('logger', () => logger, true);

// ============================================
// REGISTRAR MÓDULOS FUNCIONALES
// ============================================
const modules = [
  { name: 'Estudiantes', register: registerEstudiantesModule },
  // Agregar más módulos aquí cuando se implementen:
  // { name: 'Inscripciones', register: registerInscripcionesModule },
  // { name: 'Calificaciones', register: registerCalificacionesModule },
  // { name: 'Auth', register: registerAuthModule },
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
