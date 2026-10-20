/**
 * Punto de entrada del módulo Inscripciones
 *
 * Responsabilidades:
 * - Combinar todos los recursos del módulo Inscripciones
 * - Registrar todos los recursos en el contenedor
 *
 * Principio: Composición sobre herencia
 * Cada recurso tiene su propio container pequeño (SRP)
 * Este index los combina para mantener la estructura modular
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Inscripciones completo registrado
 */

import { registerInscripcionesResource } from './inscripciones.container.js';

/**
 * Registra el módulo completo de Inscripciones en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerInscripcionesModule(container) {
    // Registrar cada recurso individualmente
    registerInscripcionesResource(container);

    return container;
}
