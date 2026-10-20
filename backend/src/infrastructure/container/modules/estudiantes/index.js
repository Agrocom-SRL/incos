/**
 * Punto de entrada del módulo Estudiantes
 *
 * Responsabilidades:
 * - Combinar todos los recursos del módulo Estudiantes
 * - Registrar todos los recursos en el contenedor
 *
 * Principio: Composición sobre herencia
 * Cada recurso tiene su propio container pequeño (SRP)
 * Este index los combina para mantener la estructura modular
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Estudiantes completo registrado
 */

import { registerEstudiantesResource } from './estudiantes.container.js';
import { registerBecasDescuentosResource } from './becas-descuentos.container.js';
// TODO: Agregar otros recursos cuando se implementen
// import { registerLicenciasResource } from './licencias.container.js';
// import { registerDocumentosResource } from './documentos.container.js';

/**
 * Registra el módulo completo de Estudiantes en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerEstudiantesModule(container) {
    // Registrar cada recurso individualmente
    registerEstudiantesResource(container);
    registerBecasDescuentosResource(container);

    // TODO: Agregar otros recursos cuando se implementen
    // registerLicenciasResource(container);
    // registerDocumentosResource(container);

    return container;
}
