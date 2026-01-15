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
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('id')) {
      this.id = data.id;
    }
    if (data.hasOwnProperty('active')) {
      this.active = data.active;
    }
    // NOTA: No inicializamos active por defecto para permitir attributes limitados
    // Si se necesita active, debe ser proporcionado explícitamente en los attributes
    if (data.hasOwnProperty('createdAt')) {
      this.createdAt = data.createdAt;
    }
    if (data.hasOwnProperty('updatedAt')) {
      this.updatedAt = data.updatedAt;
    }
    if (data.hasOwnProperty('deletedAt')) {
      this.deletedAt = data.deletedAt;
    }
    if (data.hasOwnProperty('createdBy')) {
      this.createdBy = data.createdBy;
    }
    if (data.hasOwnProperty('updatedBy')) {
      this.updatedBy = data.updatedBy;
    }
    if (data.hasOwnProperty('deletedBy')) {
      this.deletedBy = data.deletedBy;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = {};
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('id')) {
      plainObject.id = this.id;
    }
    if (this.hasOwnProperty('active')) {
      plainObject.active = this.active;
    }
    if (this.hasOwnProperty('createdAt')) {
      plainObject.createdAt = this.createdAt;
    }
    if (this.hasOwnProperty('updatedAt')) {
      plainObject.updatedAt = this.updatedAt;
    }
    if (this.hasOwnProperty('deletedAt')) {
      plainObject.deletedAt = this.deletedAt;
    }
    if (this.hasOwnProperty('createdBy')) {
      plainObject.createdBy = this.createdBy;
    }
    if (this.hasOwnProperty('updatedBy')) {
      plainObject.updatedBy = this.updatedBy;
    }
    if (this.hasOwnProperty('deletedBy')) {
      plainObject.deletedBy = this.deletedBy;
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
