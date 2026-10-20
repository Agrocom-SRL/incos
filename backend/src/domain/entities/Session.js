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
    if (data.hasOwnProperty('userId')) {
      this.userId = data.userId;
    }
    if (data.hasOwnProperty('sessionToken')) {
      this.sessionToken = data.sessionToken;
    }
    if (data.hasOwnProperty('recoveryToken')) {
      this.recoveryToken = data.recoveryToken;
    }
    if (data.hasOwnProperty('expirationDate')) {
      this.expirationDate = data.expirationDate;
    }
    if (data.hasOwnProperty('lastLogin')) {
      this.lastLogin = data.lastLogin;
    }
    if (data.hasOwnProperty('lastLoginIp')) {
      this.lastLoginIp = data.lastLoginIp;
    }
    if (data.hasOwnProperty('device')) {
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
    if (this.hasOwnProperty('userId')) {
      plainObject.userId = this.userId;
    }
    if (this.hasOwnProperty('sessionToken')) {
      plainObject.sessionToken = this.sessionToken;
    }
    if (this.hasOwnProperty('recoveryToken')) {
      plainObject.recoveryToken = this.recoveryToken;
    }
    if (this.hasOwnProperty('expirationDate')) {
      plainObject.expirationDate = this.expirationDate;
    }
    if (this.hasOwnProperty('lastLogin')) {
      plainObject.lastLogin = this.lastLogin;
    }
    if (this.hasOwnProperty('lastLoginIp')) {
      plainObject.lastLoginIp = this.lastLoginIp;
    }
    if (this.hasOwnProperty('device')) {
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
