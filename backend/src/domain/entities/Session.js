import { BaseEntity } from './BaseEntity.js';
import { TIPOS_DISPOSITIVO_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: Session
 * Representa una sesión de usuario.
 * Contiene la lógica de negocio pura de expiración y dispositivo.
 *
 * Mapeo con BD (tabla sesiones, 04-sistema-seguridad.sql):
 * - userId ← usuario_id, sessionToken ← token_sesion, recoveryToken ← token_recuperacion
 * - expirationDate ← fecha_expiracion, lastLogin ← ultimo_login, lastLoginIp ← ip_ultimo_login
 * - device ← dispositivo
 */
export class Session extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'userId')) {
      this.userId = data.userId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'sessionToken')) {
      this.sessionToken = data.sessionToken;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'recoveryToken')) {
      this.recoveryToken = data.recoveryToken;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'expirationDate')) {
      this.expirationDate = data.expirationDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'lastLogin')) {
      this.lastLogin = data.lastLogin;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'lastLoginIp')) {
      this.lastLoginIp = data.lastLoginIp;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'device')) {
      this.device = data.device; // MOVIL, TABLET, DESKTOP
    }
  }

  /**
   * Verifica si la sesión está expirada
   * @returns {boolean}
   */
  isExpired() {
    if (!this.expirationDate) return false;
    return new Date() > new Date(this.expirationDate);
  }

  /**
   * Valida el tipo de dispositivo
   * @returns {boolean}
   */
  isValidDevice() {
    if (!this.device) return true; // Opcional
    return TIPOS_DISPOSITIVO_VALUES.includes(this.device);
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'userId')) {
      plainObject.userId = this.userId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'sessionToken')) {
      plainObject.sessionToken = this.sessionToken;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'recoveryToken')) {
      plainObject.recoveryToken = this.recoveryToken;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'expirationDate')) {
      plainObject.expirationDate = this.expirationDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'lastLogin')) {
      plainObject.lastLogin = this.lastLogin;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'lastLoginIp')) {
      plainObject.lastLoginIp = this.lastLoginIp;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'device')) {
      plainObject.device = this.device;
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
