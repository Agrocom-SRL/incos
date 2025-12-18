/**
 * Configuraci?n central del contenedor de Dependency Injection
 * Crea la instancia del container y registra todos los m?dulos de la aplicaci?n
 *
 * Estructura:
 * - Container.js: Clase base del contenedor
 * - modules/*.container.js: Registradores de cada m?dulo funcional
 * - index.js (este archivo): Punto de configuraci?n central
 */
import { Container } from '../Container.js';
import { logger } from '../../../shared/logger.js';

// ============================================
// REGISTRADORES DE M?DULOS
// ============================================
// M?dulo base: Repositorios (debe registrarse primero)
import { registerRepositoriesModule } from './repositories.container.js';

// M?dulos funcionales - Importaci?n est?tica normal
// Si el m?dulo no se puede importar, el servidor no iniciar? (comportamiento esperado)
// Esto ayuda a detectar problemas de configuraci?n temprano
import { RegisterEstudiantesModule } from './estudiantes.container.js';

// TODO: Agregar m?s m?dulos cuando se implementen:
// import { registerInscripcionesModule } from './inscripciones.container.js';
// import { registerCalificacionesModule } from './calificaciones.container.js';
// import { registerAuthModule } from './auth.container.js';

// ============================================
// CREAR INSTANCIA DEL CONTENEDOR
// ============================================
export const container = new Container();

// ============================================
// SERVICIOS GLOBALES (compartidos por todos los m?dulos)
// ============================================
container.register('logger', () => logger, true);

// ============================================
// REGISTRAR M?DULOS
// ============================================
// IMPORTANTE: Los repositorios deben registrarse primero ya que son dependencias
// de los m?dulos funcionales (use cases, controllers, etc.)
const modules = [
  { name: 'Repositorios', register: registerRepositoriesModule },
  // Solo agregar m?dulo de Estudiantes si se import? correctamente
  ...(RegisterEstudiantesModule ? [{ name: 'Estudiantes', register: RegisterEstudiantesModule }] : []),
  // Agregar m?s m?dulos aqu? cuando se implementen:
  // { name: 'Inscripciones', register: registerInscripcionesModule },
  // { name: 'Calificaciones', register: registerCalificacionesModule },
  // { name: 'Auth', register: registerAuthModule },
];

modules.forEach((module) => {
  try {
    module.register(container);
    logger.info(`Modulo '${module.name}' registrado en el contenedor de DI`);
  } catch (error) {
    logger.error(`Error al registrar modulo '${module.name}':`, error);
  }
});

export default container;
