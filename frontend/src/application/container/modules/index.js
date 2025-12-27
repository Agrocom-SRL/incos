/**
 * Punto de entrada del registro de módulos
 * 
 * Responsabilidades:
 * - Registrar módulos por dominio/entidad (carreras, estudiantes, etc.)
 * 
 * Orden de registro:
 * 1. Módulos base (carreras, catálogos simples)
 * 2. Módulos complejos (estudiantes, docentes, etc.)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta el registro de todos los módulos
 */

import { registerCarrerasModule } from './carreras.container.js';
// Futuro: import { registerEstudiantesModule } from './estudiantes.container.js';
// Futuro: import { registerDocentesModule } from './docentes.container.js';

/**
 * Registra todos los módulos en el factory
 * 
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con todos los módulos registrados
 */
export function registerAllModules(factory) {
  // 1. Módulos base (catálogos, simples)
  registerCarrerasModule(factory);

  // 2. Módulos complejos (con lógica de negocio)
  // registerEstudiantesModule(factory);
  // registerDocentesModule(factory);
  // registerGestionesModule(factory);
  // registerInscripcionesModule(factory);
  // etc.

  return factory;
}

