/**
 * Utilidades para generación de códigos de estudiantes
 */
export class StudentCodeUtils {
  /**
   * Genera un código temporal único para un estudiante
   * Formato: TEMP-{CI6}-{timestamp4}-{random2}
   * Máximo 20 caracteres (VARCHAR(20) en BD)
   * Ejemplo: TEMP-345678-3600-42 (20 caracteres)
   * 
   * @param {string} ci - Número de CI del estudiante
   * @returns {string} Código temporal generado (máx 20 caracteres)
   */
  static generateTemporaryCode(ci) {
    if (!ci) {
      throw new Error('CI es requerido para generar código temporal');
    }

    // Usar solo los últimos 6 dígitos del CI para mantener el código corto pero con mejor unicidad
    const ciSuffix = ci.slice(-6);
    // Usar solo los últimos 4 dígitos del timestamp
    const timestamp = Date.now().toString().slice(-4);
    // Random de 2 dígitos (00-99)
    const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    // Formato: TEMP-{CI6}-{timestamp4}-{random2}
    // Ejemplo: TEMP-345678-3600-42 (20 caracteres) - cabe en VARCHAR(20)
    return `TEMP-${ciSuffix}-${timestamp}-${randomSuffix}`;
  }

  /**
   * Valida si un código es temporal
   * Formato esperado: TEMP-{CI6}-{timestamp4}-{random2}
   * Ejemplo: TEMP-345678-3600-42
   * 
   * @param {string} code - Código a validar
   * @returns {boolean} true si es un código temporal
   */
  static isTemporaryCode(code) {
    if (!code) return false;
    // Verifica que el código empiece con 'TEMP' (con o sin guión)
    return code.startsWith('TEMP');
  }
}

export default StudentCodeUtils;

