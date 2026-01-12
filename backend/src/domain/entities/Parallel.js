import { BaseEntity } from './BaseEntity.js';
import { TURNOS_VALUES, TURNOS } from '../constants/cursos.constants.js';

/**
 * Entidad de Dominio: Parallel
 * Representa grupos multi-materia por carrera y periodo
 * Estructura estable de grupos vinculados a un periodo del plan de estudios
 */
export class Parallel extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.careerId = data.careerId || null;
    this.periodId = data.periodId || null;
    this.name = data.name || null;
    this.shift = data.shift || null;
    this.description = data.description || null;
  }

  /**
   * Valida el turno
   * @returns {boolean}
   */
  isValidShift() {
    if (!this.shift) return false;
    return TURNOS_VALUES.includes(this.shift);
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      careerId: this.careerId,
      periodId: this.periodId,
      name: this.name,
      shift: this.shift,
      description: this.description,
    };
  }
}
