/**
 * Punto de entrada del registro de módulos
 * 
 * Responsabilidades:
 * - Registrar módulos por dominio/entidad (estudiantes, docentes, etc.)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta el registro de todos los módulos
 */

import { registerEstudiantesModule } from '@container/modules/estudiantes.container.js';
import { registerConfiguracionModule } from '@container/modules/configuracion.container.js';
import { registerAcademicoModule } from '@container/modules/academico.container.js';
// Futuro: import { registerDocentesModule } from './docentes.container.js';

/**
 * Registra todos los módulos en el factory
 * 
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con todos los módulos registrados
 */
export function registerAllModules(factory) {
  // Módulos complejos (con lógica de negocio)
  registerEstudiantesModule(factory);
  registerConfiguracionModule(factory);
  registerAcademicoModule(factory);
  // registerDocentesModule(factory);
  // registerGestionesModule(factory);
  // registerInscripcionesModule(factory);
  // etc.

  return factory;
}

