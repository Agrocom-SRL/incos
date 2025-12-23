/**
 * Contenedor de Inyección de Dependencias (DI Container)
 * Punto de entrada único para resolver todas las dependencias de la aplicación.
 */

import { Container } from './Container.js';
import { registerAllModules } from './modules/index.js';

/**
 * Construye e inicializa el contenedor con todos los módulos registrados
 * @returns {Container} Contenedor configurado con servicios, repositorios y módulos
 */
export function buildContainer() {
  const container = new Container();
  registerAllModules(container);
  return container;
}

/**
 * Instancia única del contenedor (singleton global)
 */
const container = buildContainer();

export default container;
export { container };
