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
    if (data.hasOwnProperty('username')) {
      this.username = data.username;
    }
    if (data.hasOwnProperty('passwordHash')) {
      this.passwordHash = data.passwordHash;
    }
    if (data.hasOwnProperty('photoUrl')) {
      this.photoUrl = data.photoUrl;
    }
    if (data.hasOwnProperty('roleId')) {
      this.roleId = data.roleId;
    }
    if (data.hasOwnProperty('referenceId')) {
      this.referenceId = data.referenceId;
    }
    if (data.hasOwnProperty('referenceType')) {
      this.referenceType = data.referenceType;
    }
    if (data.hasOwnProperty('state')) {
      this.state = data.state; // BLOQUEADO, SUSPENDIDO, RETIRADO, null = activo
    }
    if (data.hasOwnProperty('stateChangeDate')) {
      this.stateChangeDate = data.stateChangeDate;
    }
    if (data.hasOwnProperty('stateChangeReason')) {
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
    if (this.hasOwnProperty('username')) {
      plainObject.username = this.username;
    }
    if (this.hasOwnProperty('passwordHash')) {
      plainObject.passwordHash = this.passwordHash;
    }
    if (this.hasOwnProperty('photoUrl')) {
      plainObject.photoUrl = this.photoUrl;
    }
    if (this.hasOwnProperty('roleId')) {
      plainObject.roleId = this.roleId;
    }
    if (this.hasOwnProperty('referenceId')) {
      plainObject.referenceId = this.referenceId;
    }
    if (this.hasOwnProperty('referenceType')) {
      plainObject.referenceType = this.referenceType;
    }
    if (this.hasOwnProperty('state')) {
      plainObject.state = this.state;
    }
    if (this.hasOwnProperty('stateChangeDate')) {
      plainObject.stateChangeDate = this.stateChangeDate;
    }
    if (this.hasOwnProperty('stateChangeReason')) {
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
