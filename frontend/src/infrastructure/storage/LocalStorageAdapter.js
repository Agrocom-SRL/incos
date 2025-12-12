/**
 * Adapter para localStorage
 * 
 * Single Responsibility: Solo maneja operaciones de localStorage
 * Adapter Pattern: Abstrae localStorage para poder cambiarlo en el futuro
 * 
 * Ubicación: infrastructure/storage/ (implementación técnica de almacenamiento)
 */
export class LocalStorageAdapter {
  /**
   * Guarda un valor en localStorage
   * @param {string} key - Clave
   * @param {any} value - Valor (se serializa automáticamente si es objeto)
   */
  static set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Obtiene un valor de localStorage
   * @param {string} key - Clave
   * @param {any} defaultValue - Valor por defecto si no existe
   * @returns {any} Valor deserializado o defaultValue
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Obtiene un valor como string (sin deserializar)
   * Útil para tokens que son strings simples
   * @param {string} key - Clave
   * @param {string|null} defaultValue - Valor por defecto
   * @returns {string|null} Valor como string
   */
  static getString(key, defaultValue = null) {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
