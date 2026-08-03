/**
 * Interfaz del Repositorio de Sesiones de Refuerzo (módulo TUT ·
 * Acompañamiento). Tablas: sesiones_refuerzo +
 * sesion_refuerzo_estudiantes (listado desde la vista 161).
 *
 * Extiende IBaseRepository (arquetipo A: CRUD) con el registro batch de
 * asistencia/progreso. Contrato A4-A9 de docs/plan/tutorias-plan-desarrollo.md.
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class ISesionRefuerzoRepository extends IBaseRepository {
  /**
   * Registro batch de asistencia y progreso de estudiantes (A9,
   * sesion·EDITAR, `estudiantes`).
   * @param {string|number} _id
   * @param {Array<Object>} _estudiantes - [{ id?, matriculaMateriaId, asistio, progreso, observaciones }]
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async registrarEstudiantes(_id, _estudiantes) {
    throw new Error('Método registrarEstudiantes debe ser implementado');
  }
}
