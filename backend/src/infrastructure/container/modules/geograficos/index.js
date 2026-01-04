/**
 * Punto de entrada del módulo Geográficos
 * 
 * Responsabilidades:
 * - Combinar todos los recursos del módulo Geográficos
 * - Registrar todos los recursos en el contenedor
 * 
 * Principio: Composición sobre herencia
 * Cada recurso tiene su propio container pequeño (SRP)
 * Este index los combina para mantener la estructura modular
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Geográficos completo registrado
 */

import { registerPaisesResource } from './paises.container.js';
import { registerDepartamentosResource } from './departamentos.container.js';
import { registerProvinciasResource } from './provincias.container.js';
import { registerMunicipiosResource } from './municipios.container.js';

/**
 * Registra el módulo completo de Geográficos en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerGeograficosModule(container) {
    // Registrar cada recurso individualmente
    registerPaisesResource(container);
    registerDepartamentosResource(container);
    registerProvinciasResource(container);
    registerMunicipiosResource(container);

    return container;
}

