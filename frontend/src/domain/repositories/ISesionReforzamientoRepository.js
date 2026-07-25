/**
 * Interfaz del Repositorio de Sesiones de Reforzamiento (módulo TUT ·
 * Acompañamiento). Tablas: sesiones_reforzamiento +
 * sesion_reforzamiento_participantes (listado desde la vista 161).
 *
 * Extiende IBaseRepository (arquetipo A: CRUD) con el registro batch de
 * asistencia/progreso. Contrato A4-A9 de docs/plan/tutorias-plan-desarrollo.md.
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class ISesionReforzamientoRepository extends IBaseRepository {
  /**
   * Registro batch de asistencia y progreso de participantes (A9,
   * sesion·EDITAR, `participantes`).
   * @param {string|number} _id
   * @param {Array<Object>} _participantes - [{ id?, matriculaMateriaId, asistio, progreso, observaciones }]
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async registrarParticipantes(_id, _participantes) {
    throw new Error('Método registrarParticipantes debe ser implementado');
  }
}
