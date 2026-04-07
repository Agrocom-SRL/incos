/**
 * Contenedor de Inyección de Dependencias (DI Container)
 * Punto de entrada único para resolver todas las dependencias de la aplicación.
 */

import { Container } from './Container.js';
import { registerAllModules } from './modules/index.js';
import { registerInfrastructure } from './infrastructure/index.js';
import { setAppContainer } from '../../presentation/middleware/container-ref.js';

/**
 * Construye e inicializa el contenedor con todos los módulos registrados
 * @returns {Container} Contenedor configurado con servicios, repositorios y módulos
 */
export function buildContainer() {
  const container = new Container();
  // 1) Infraestructura base (servicios y repositorios)
  registerInfrastructure(container);
  // 2) Módulos de dominio
  registerAllModules(container);
  return container;
}

/**
 * Instancia única del contenedor (singleton global)
 */
const container = buildContainer();
setAppContainer(container);

export default container;
export { container };
