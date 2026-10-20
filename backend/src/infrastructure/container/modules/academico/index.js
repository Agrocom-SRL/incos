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
import { registerOfertaResource } from './oferta.container.js';
import { registerGestionesResource } from './gestiones.container.js';
import { registerCalificacionesResource } from './calificaciones.container.js';
import { registerAsistenciaResource } from './asistencia.container.js';
import { registerAvanceResource } from './avance.container.js';
import { registerLicenciasResource } from './licencias.container.js';
import { registerLibrosResource } from './libros.container.js';
import { registerNivelacionesResource } from './nivelaciones.container.js';
import { registerHorariosResource } from './horarios.container.js';
import { registerAcompanamientoResource } from './acompanamiento.container.js';

/**
 * Registra el módulo completo de Académico en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerAcademicoModule(container) {
    // Registrar cada recurso individualmente
    registerParalelosResource(container);
    registerHorariosResource(container);
    registerOfertaResource(container);
    registerGestionesResource(container);
    registerCalificacionesResource(container);
    registerAsistenciaResource(container);
    registerAvanceResource(container);
    registerLicenciasResource(container);
    registerLibrosResource(container);
    registerNivelacionesResource(container);
    // Acompañamiento pedagógico (reclasificado desde el módulo Titulación/TUT
    // el 2026-07-31: sus datos se derivan de asignaciones_docentes/vistas del
    // centralizador, sin FK a proyectos_grado/modalidades_grado).
    registerAcompanamientoResource(container);

    return container;
}
