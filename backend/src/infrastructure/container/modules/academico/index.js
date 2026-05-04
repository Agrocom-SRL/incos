/**
 * Punto de entrada del módulo Académico
 * 
 * Responsabilidades:
 * - Combinar todos los recursos del módulo Académico
 * - Registrar todos los recursos en el contenedor
 * 
 * Principio: Composición sobre herencia
 * Cada recurso tiene su propio container pequeño (SRP)
 * Este index los combina para mantener la estructura modular
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Académico completo registrado
 */

import { registerParalelosResource } from './paralelos.container.js';
import { registerGestionesResource } from './gestiones.container.js';
import { registerCursosResource } from './cursos.container.js';

/**
 * Registra el módulo completo de Académico en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerAcademicoModule(container) {
    // Registrar cada recurso individualmente
    registerParalelosResource(container);
    registerGestionesResource(container);
    registerCursosResource(container);

    return container;
}
