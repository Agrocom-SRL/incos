import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IConfiguracionSistemaRepository
 * Define el contrato que debe cumplir el repositorio de configuración del sistema
 * Extiende IRepository para métodos comunes
 */
export class IConfiguracionSistemaRepository extends IRepository {
  /**
   * Buscar configuración por clave
   * @param {string} clave - Clave de la configuración
   * @param {Object} options - Opciones opcionales (includeInactive)
   * @returns {Promise<SystemConfiguration|null>}
   */
  async findByClave(clave, options = {}) {
    throw new Error('Method findByClave must be implemented');
  }

  /**
   * Obtener o crear una configuración por clave
   * @param {string} clave - Clave de la configuración
   * @param {string} valor - Valor por defecto si no existe
   * @param {string} tipo - Tipo de dato (STRING, NUMBER, BOOLEAN, JSON, DATE)
   * @param {string} descripcion - Descripción
   * @param {number} userId - ID del usuario
   * @returns {Promise<SystemConfiguration>}
   */
  async findOrCreate(clave, valor, tipo = 'STRING', descripcion = null, userId = null) {
    throw new Error('Method findOrCreate must be implemented');
  }

  /**
   * Incrementar un valor numérico de configuración
   * @param {string} clave - Clave de la configuración
   * @param {number} incremento - Cantidad a incrementar (default: 1)
   * @param {number} userId - ID del usuario
   * @returns {Promise<SystemConfiguration>}
   */
  async incrementValue(clave, incremento = 1, userId = null) {
    throw new Error('Method incrementValue must be implemented');
  }
}

