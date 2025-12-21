/**
 * Servicio de Dominio: StudentCodeGenerator
 * Genera códigos únicos para estudiantes
 * Formato: {AÑO}-{CORRELATIVO}
 * donde AÑO es el año de la gestión y CORRELATIVO es un número secuencial por gestión
 * Ejemplo: 2025-0001, 2025-0002, ..., 2025-1234
 */
export class StudentCodeGenerator {
  /**
   * Genera un código de estudiante
   * @param {number|string} anio - Año de la gestión (ej: 2025)
   * @param {number} correlativo - Número correlativo
   * @returns {string} Código en formato {AÑO}-{CORRELATIVO}
   */
  static generate(anio, correlativo) {
    const anioStr = anio.toString();
    const correlativoFormateado = correlativo.toString().padStart(4, '0');
    return `${anioStr}-${correlativoFormateado}`;
  }

  /**
   * Valida el formato de un código de estudiante
   * @param {string} codigo
   * @returns {boolean}
   */
  static isValid(codigo) {
    return /^\d{4}-\d{4}$/.test(codigo);
  }

  /**
   * Extrae el año del código de estudiante
   * @param {string} codigo
   * @returns {number|null}
   */
  static extractYear(codigo) {
    const match = codigo.match(/^(\d{4})-\d{4}$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Extrae el correlativo del código de estudiante
   * @param {string} codigo
   * @returns {number|null}
   */
  static extractCorrelativo(codigo) {
    const match = codigo.match(/^\d{4}-(\d{4})$/);
    return match ? parseInt(match[1], 10) : null;
  }
}
