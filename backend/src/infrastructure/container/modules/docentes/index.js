/**
 * Registro del módulo Docentes (DOC)
 *
 * Orquesta los recursos del módulo:
 * 1. Núcleo Docentes + Asignaciones (docentes.container.js, que a su vez
 *    registra asignaciones-docentes.container.js).
 * 2. Supervisión docente (supervision.container.js: fichas de seguimiento en
 *    clase, schema 27, router /supervision-docente).
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Docentes registrado
 */

import { registerDocentesModule as registerDocentesCore } from './docentes.container.js';
import { registerSupervisionDocenteResource } from './supervision.container.js';

export function registerDocentesModule(container) {
  registerDocentesCore(container);
  registerSupervisionDocenteResource(container);
  return container;
}
