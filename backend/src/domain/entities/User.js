import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_USUARIOS_VALUES, TIPOS_REFERENCIA_VALUES } from '../../shared/constants/index.js';

/**
 * Entidad de Dominio: User
 * Representa un usuario del sistema
 */
export class User extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.username = data.username || null;
    this.email = data.email || null;
    this.passwordHash = data.passwordHash || null;
    this.photoUrl = data.photoUrl || null;
    this.roleId = data.roleId || null;
    this.referenceId = data.referenceId || null;
    this.referenceType = data.referenceType || null;
    this.state = data.state || null; // BLOQUEADO, SUSPENDIDO, RETIRADO, null = activo
    this.stateChangeDate = data.stateChangeDate || null;
    this.stateChangeReason = data.stateChangeReason || null;
  }

  /**
   * Verifica si el usuario está activo
   * @returns {boolean}
   */
  isActive() {
    return super.isActive() && this.state === null;
  }

  /**
   * Verifica si el usuario está bloqueado
   * @returns {boolean}
   */
  isBlocked() {
    return this.state === 'BLOQUEADO';
  }

  /**
   * Verifica si el usuario está suspendido
   * @returns {boolean}
   */
  isSuspended() {
    return this.state === 'SUSPENDIDO';
  }

  /**
   * Valida el formato del email
   * @returns {boolean}
   */
  isValidEmail() {
    if (!this.email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /**
   * Valida el tipo de referencia
   * @returns {boolean}
   */
  isValidReferenceType() {
    if (!this.referenceType) return true; // Opcional
    return TIPOS_REFERENCIA_VALUES.includes(this.referenceType);
  }

  /**
   * Valida el estado del usuario
   * @returns {boolean}
   */
  isValidState() {
    if (!this.state) return true; // null = activo
    return ESTADOS_USUARIOS_VALUES.includes(this.state);
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      username: this.username,
      email: this.email,
      passwordHash: this.passwordHash,
      photoUrl: this.photoUrl,
      roleId: this.roleId,
      referenceId: this.referenceId,
      referenceType: this.referenceType,
      state: this.state,
      stateChangeDate: this.stateChangeDate,
      stateChangeReason: this.stateChangeReason,
    };
  }
}
