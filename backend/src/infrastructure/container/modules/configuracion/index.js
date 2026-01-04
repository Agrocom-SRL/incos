/**
 * Punto de entrada del módulo Configuración
 * 
 * Responsabilidades:
 * - Combinar todos los recursos del módulo Configuración
 * - Registrar todos los recursos en el contenedor
 * 
 * Principio: Composición sobre herencia
 * Cada recurso tiene su propio container pequeño (SRP)
 * Este index los combina para mantener la estructura modular
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Configuración completo registrado
 */

import { registerCarrerasResource } from './carreras.container.js';
import { registerMateriasResource } from './materias.container.js';
import { registerDiscapacidadResource } from './discapacidad.container.js';

/**
 * Registra el módulo completo de Configuración en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerConfiguracionModule(container) {
    // Registrar cada recurso individualmente
    registerCarrerasResource(container);
    registerMateriasResource(container);
    registerDiscapacidadResource(container);

    return container;
}

