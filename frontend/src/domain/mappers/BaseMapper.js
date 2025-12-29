/**
 * Mapper Base
 * Factoriza métodos comunes de transformación de datos
 * 
 * Clean Architecture:
 * - Domain Layer: Transformación base entre capas
 * 
 * Todos los mappers deben extender de esta clase para reutilizar métodos comunes.
 */

export class BaseMapper {
  /**
   * Convierte un array de datos usando un método de transformación
   * @param {Array} dataArray - Array de datos a transformar
   * @param {Function} transformMethod - Método de transformación (ej: this.toDomain)
   * @returns {Array} - Array de datos transformados
   */
  static arrayTransform(dataArray, transformMethod) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => transformMethod.call(this, data)).filter(Boolean);
  }

  /**
   * Convierte un array de datos del backend a formato de dominio
   * @param {Array} dataBackendArray - Array de datos del backend
   * @returns {Array} - Array de datos normalizados
   */
  static arrayToDomain(dataBackendArray) {
    // En métodos estáticos, 'this' se refiere a la clase (subclase si se hereda)
    if (!this.toDomain) {
      throw new Error('toDomain() method must be implemented in the subclass');
    }
    return this.arrayTransform(dataBackendArray, this.toDomain);
  }

  /**
   * Convierte un array de datos del backend a formato simple para UI
   * @param {Array} dataBackendArray - Array de datos del backend
   * @returns {Array} - Array de datos simples para UI
   */
  static arrayToSimpleUI(dataBackendArray) {
    // En métodos estáticos, 'this' se refiere a la clase (subclase si se hereda)
    if (!this.toSimpleUI) {
      throw new Error('toSimpleUI() method must be implemented in the subclass');
    }
    return this.arrayTransform(dataBackendArray, this.toSimpleUI);
  }

  /**
   * Normaliza nombres de campos entre snake_case y camelCase
   * @param {Object} data - Objeto con datos
   * @param {Object} fieldMapping - Mapeo de campos { snake_case: 'camelCase' }
   * @returns {Object} - Objeto con campos normalizados
   */
  static normalizeFields(data, fieldMapping) {
    if (!data || typeof data !== 'object') return data;

    const normalized = { ...data };

    Object.keys(fieldMapping).forEach(snakeKey => {
      const camelKey = fieldMapping[snakeKey];
      // Si existe el campo en snake_case y no en camelCase, copiarlo
      if (normalized[snakeKey] !== undefined && normalized[camelKey] === undefined) {
        normalized[camelKey] = normalized[snakeKey];
      }
    });

    return normalized;
  }

  /**
   * Valida que los datos no sean null o undefined
   * @param {*} data - Datos a validar
   * @returns {boolean}
   */
  static isValidData(data) {
    return data !== null && data !== undefined;
  }
}

