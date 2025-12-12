import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Prerequisite
 * Representa un prerrequisito entre materias
 */
export class Prerequisite extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.subjectId = data.subjectId || null;
    this.prerequisiteSubjectId = data.prerequisiteSubjectId || null;
    this.description = data.description || null;
  }

  /**
   * Valida que una materia no sea prerrequisito de sí misma
   * @returns {boolean}
   */
  isValid() {
    if (!this.subjectId || !this.prerequisiteSubjectId) return false;
    return this.subjectId !== this.prerequisiteSubjectId;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      subjectId: this.subjectId,
      prerequisiteSubjectId: this.prerequisiteSubjectId,
      description: this.description,
    };
  }
}
