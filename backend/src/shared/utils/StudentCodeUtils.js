/**
 * Utilidades para generación de códigos de estudiantes
 */
export class StudentCodeUtils {
  /**
   * Genera un código temporal único para un estudiante
   * Formato: TEMP-{CI}-{timestamp}-{randomSuffix}
   * 
   * @param {string} ci - Número de CI del estudiante
   * @returns {string} Código temporal generado
   */
  static generateTemporaryCode(ci) {
    if (!ci) {
      throw new Error('CI es requerido para generar código temporal');
    }

    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TEMP-${ci}-${timestamp}-${randomSuffix}`;
  }

  /**
   * Valida si un código es temporal
   * @param {string} code - Código a validar
   * @returns {boolean} true si es un código temporal
   */
  static isTemporaryCode(code) {
    if (!code) return false;
    return code.startsWith('TEMP-');
  }
}

export default StudentCodeUtils;

