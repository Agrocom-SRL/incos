import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_ASIGNACION_DOCENTE_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: TeacherAssignment
 * Representa la asignación de un docente a un curso en una gestión
 */
export class TeacherAssignment extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.courseId = data.courseId || null;
    this.managementId = data.managementId || null;
    this.teacherId = data.teacherId || null;
    this.weeklyHours = data.weeklyHours !== undefined ? data.weeklyHours : 0;
    this.state = data.state || 'PROPUESTA'; // PROPUESTA, APROBADA, ABIERTA, CERRADA, CANCELADA
    this.cancellationReason = data.cancellationReason || null;
    this.observations = data.observations || null;
  }

  /**
   * Valida el estado de la asignación
   * @returns {boolean}
   */
  isValidState() {
    if (!this.state) return false;
    return ESTADOS_ASIGNACION_DOCENTE_VALUES.includes(this.state);
  }

  /**
   * Verifica si la asignación está abierta
   * @returns {boolean}
   */
  isOpen() {
    return this.state === 'ABIERTA';
  }

  /**
   * Verifica si la asignación está aprobada
   * @returns {boolean}
   */
  isApproved() {
    return this.state === 'APROBADA';
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      courseId: this.courseId,
      managementId: this.managementId,
      teacherId: this.teacherId,
      weeklyHours: this.weeklyHours,
      state: this.state,
      cancellationReason: this.cancellationReason,
      observations: this.observations,
    };
  }
}
