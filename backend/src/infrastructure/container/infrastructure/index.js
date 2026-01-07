/**
 * Punto de entrada para registrar infraestructura base:
 * - Servicios (logger, formatters, middleware, etc.)
 * - Repositorios (acceso a datos)
 *
 * Se ejecuta antes del registro de módulos de dominio.
 */

import { registerServicesModule } from './services.container.js';
import { registerRepositoriesModule } from './repositories.container.js';

/**
 * Registra infraestructura base (servicios y repositorios)
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor configurado con servicios y repositorios
 */
export function registerInfrastructure(container) {
    // 1. Servicios base
    registerServicesModule(container);

    // 2. Repositorios (dependen de servicios)
    registerRepositoriesModule(container);

    return container;
}


