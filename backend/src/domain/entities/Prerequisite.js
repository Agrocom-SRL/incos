import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Prerequisite
 * Representa un prerrequisito entre asignaturas de un plan de estudios
 */
export class Prerequisite extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('studyPlanId')) {
      this.studyPlanId = data.studyPlanId;
    }
    if (data.hasOwnProperty('subjectId')) {
      this.subjectId = data.subjectId; // Asignatura que requiere el prerrequisito
    }
    if (data.hasOwnProperty('prerequisiteId')) {
      this.prerequisiteId = data.prerequisiteId; // Asignatura que debe aprobarse antes
    }
  }

  /**
   * Valida que una asignatura no sea prerrequisito de sí misma
   * @returns {boolean}
   */
  isValid() {
    if (!this.subjectId || !this.prerequisiteId) return false;
    return this.subjectId !== this.prerequisiteId;
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('studyPlanId')) {
      plainObject.studyPlanId = this.studyPlanId;
    }
    if (this.hasOwnProperty('subjectId')) {
      plainObject.subjectId = this.subjectId;
    }
    if (this.hasOwnProperty('prerequisiteId')) {
      plainObject.prerequisiteId = this.prerequisiteId;
    }

    return plainObject;
  }

  /**
   * Convierte la entidad a JSON
   * Usa toPlainObject() para serialización
   * @returns {Object}
   */
  toJSON() {
    return this.toPlainObject();
  }
}
