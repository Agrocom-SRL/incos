/**
 * Punto de entrada del registro de módulos
 * 
 * Responsabilidades:
 * - Registrar servicios base (logger, file upload, etc.)
 * - Registrar repositorios de infraestructura
 * - Registrar módulos de dominio (estudiantes, etc.)
 * 
 * Orden de registro:
 * 1. Servicios base (no dependen de nada)
 * 2. Repositorios (dependen de servicios)
 * 3. Módulos de dominio (dependen de repositorios y servicios)
 */

import { registerServicesModule } from './services.container.js';
import { registerRepositoriesModule } from './repositories.container.js';
import { registerEstudiantesModule } from './estudiantes.container.js';

/**
 * Registra todos los módulos en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con todos los módulos registrados
 */
export function registerAllModules(container) {
    // 1. Servicios base (logger, upload, pdf, etc.)
    registerServicesModule(container);

    // 2. Repositorios (infraestructura)
    registerRepositoriesModule(container);

    // 3. Módulos de dominio (use cases + controllers + routers)
    registerEstudiantesModule(container);

    return container;
}