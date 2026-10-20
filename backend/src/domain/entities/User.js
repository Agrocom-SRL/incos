import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_USUARIOS_VALUES, ESTADOS_USUARIOS, TIPOS_REFERENCIA_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: User
 * Representa un usuario del sistema.
 * Contiene la lógica de negocio pura del usuario (estado, referencia polimórfica).
 *
 * Mapeo con BD (tabla usuarios, 04-sistema-seguridad.sql):
 * - roleId ← rol_id, referenceId ← referencia_id, referenceType ← tipo_referencia
 * - state ← estado, stateChangeDate ← fecha_cambio_estado, stateChangeReason ← motivo_cambio_estado
 * - photoUrl ← foto_url, passwordHash ← password_hash
 */
export class User extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'username')) {
      this.username = data.username;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'passwordHash')) {
      this.passwordHash = data.passwordHash;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'photoUrl')) {
      this.photoUrl = data.photoUrl;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'roleId')) {
      this.roleId = data.roleId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'referenceId')) {
      this.referenceId = data.referenceId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'referenceType')) {
      this.referenceType = data.referenceType;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'state')) {
      this.state = data.state; // BLOQUEADO, SUSPENDIDO, RETIRADO, null = activo
    }
    if (Object.prototype.hasOwnProperty.call(data, 'stateChangeDate')) {
      this.stateChangeDate = data.stateChangeDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'stateChangeReason')) {
      this.stateChangeReason = data.stateChangeReason;
    }
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
    return this.state === ESTADOS_USUARIOS.BLOQUEADO;
  }

  /**
   * Verifica si el usuario está suspendido
   * @returns {boolean}
   */
  isSuspended() {
    return this.state === ESTADOS_USUARIOS.SUSPENDIDO;
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'username')) {
      plainObject.username = this.username;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'passwordHash')) {
      plainObject.passwordHash = this.passwordHash;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'photoUrl')) {
      plainObject.photoUrl = this.photoUrl;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'roleId')) {
      plainObject.roleId = this.roleId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'referenceId')) {
      plainObject.referenceId = this.referenceId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'referenceType')) {
      plainObject.referenceType = this.referenceType;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'state')) {
      plainObject.state = this.state;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'stateChangeDate')) {
      plainObject.stateChangeDate = this.stateChangeDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'stateChangeReason')) {
      plainObject.stateChangeReason = this.stateChangeReason;
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
