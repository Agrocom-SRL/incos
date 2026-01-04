/**
 * Punto de entrada del módulo Referencia
 * 
 * Responsabilidades:
 * - Combinar todos los recursos del módulo Referencia
 * - Registrar todos los recursos en el contenedor
 * 
 * Principio: Composición sobre herencia
 * Cada recurso tiene su propio container pequeño (SRP)
 * Este index los combina para mantener la estructura modular
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Referencia completo registrado
 */

import { registerIdiomasResource } from './idiomas.container.js';
import { registerEstadosCivilesResource } from './estados-civiles.container.js';
import { registerTiposParentescoResource } from './tipos-parentesco.container.js';
import { registerDocumentacionResource } from './documentacion.container.js';

/**
 * Registra el módulo completo de Referencia en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerReferenciaModule(container) {
    // Registrar cada recurso individualmente
    registerIdiomasResource(container);
    registerEstadosCivilesResource(container);
    registerTiposParentescoResource(container);
    registerDocumentacionResource(container);

    return container;
}

