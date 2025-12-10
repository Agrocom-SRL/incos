/**
 * Servicio de Dominio: StudentCodeGenerator
 * Genera códigos únicos para estudiantes
 * Formato: EST-YYYY-NNNN
 * donde YYYY es el año de ingreso y NNNN es un número secuencial
 */
export class StudentCodeGenerator {
  /**
   * Genera un código de estudiante
   * @param {number} gestionIngresoId - ID de la gestión de ingreso
   * @param {string} gestionCodigo - Código de la gestión (ej: "2025-1")
   * @param {number} siguienteNumero - Número secuencial siguiente
   * @returns {string} Código en formato EST-YYYY-NNNN
   */
  static generate(gestionCodigo, siguienteNumero) {
    // Extraer el año de la gestión (ej: "2025-1" -> "2025")
    const anio = gestionCodigo.split('-')[0];
    const numeroFormateado = siguienteNumero.toString().padStart(4, '0');
    return `EST-${anio}-${numeroFormateado}`;
  }

  /**
   * Valida el formato de un código de estudiante
   * @param {string} codigo
   * @returns {boolean}
   */
  static isValid(codigo) {
    return /^EST-\d{4}-\d{4}$/.test(codigo);
  }

  /**
   * Extrae el año del código de estudiante
   * @param {string} codigo
   * @returns {number|null}
   */
  static extractYear(codigo) {
    const match = codigo.match(/^EST-(\d{4})-\d{4}$/);
    return match ? parseInt(match[1], 10) : null;
  }
}
