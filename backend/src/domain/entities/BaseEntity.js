/**
 * Entidad Base: BaseEntity
 * Factoriza los atributos comunes de auditoría para todas las entidades
 * 
 * Atributos comunes:
 * - id: Identificador único
 * - active: Estado activo/inactivo
 * - createdAt: Fecha de creación
 * - updatedAt: Fecha de modificación
 * - deletedAt: Fecha de eliminación (soft delete)
 * - createdBy: Usuario que creó
 * - updatedBy: Usuario que modificó
 * - deletedBy: Usuario que eliminó
 */
export class BaseEntity {
  constructor(data = {}) {
    this.id = data.id || null;
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedBy = data.deletedBy || null;
  }

  /**
   * Verifica si la entidad está activa
   * @returns {boolean}
   */
  isActive() {
    return this.active === true;
  }

  /**
   * Verifica si la entidad está eliminada (soft delete)
   * @returns {boolean}
   */
  isDeleted() {
    return this.deletedAt !== null;
  }

  /**
   * Activa la entidad
   */
  activate() {
    this.active = true;
    this.updatedAt = new Date();
  }

  /**
   * Desactiva la entidad
   */
  deactivate() {
    this.active = false;
    this.updatedAt = new Date();
  }

  /**
   * Marca la entidad como eliminada (soft delete)
   * @param {number} userId - ID del usuario que elimina
   */
  softDelete(userId = null) {
    this.deletedAt = new Date();
    this.deletedBy = userId;
    this.active = false;
  }

  /**
   * Restaura una entidad eliminada
   */
  restore() {
    this.deletedAt = null;
    this.deletedBy = null;
    this.active = true;
    this.updatedAt = new Date();
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      id: this.id,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedBy: this.deletedBy,
    };
  }
}
