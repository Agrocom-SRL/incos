import { BaseEntity } from './BaseEntity.js';
import { TIPOS_DISPOSITIVO_VALUES } from '../../shared/constants/index.js';

/**
 * Entidad de Dominio: Session
 * Representa una sesión de usuario
 */
export class Session extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.userId = data.userId || null;
    this.sessionToken = data.sessionToken || null;
    this.recoveryToken = data.recoveryToken || null;
    this.expirationDate = data.expirationDate || null;
    this.lastLogin = data.lastLogin || null;
    this.lastLoginIp = data.lastLoginIp || null;
    this.device = data.device || null; // MOVIL, TABLET, DESKTOP
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      userId: this.userId,
      sessionToken: this.sessionToken,
      recoveryToken: this.recoveryToken,
      expirationDate: this.expirationDate,
      lastLogin: this.lastLogin,
      lastLoginIp: this.lastLoginIp,
      device: this.device,
    };
  }
}
