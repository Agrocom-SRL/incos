/**
 * Interfaz del servicio de generación del Boletín de Calificaciones (.pdf).
 *
 * Contrato que debe cumplir cualquier implementación de infraestructura que arme
 * el documento PDF del boletín de UN estudiante a partir del payload ya formado
 * por la capa de aplicación (`construirDatosBoletinEstudiante`).
 *
 * Clean Architecture:
 * - Domain: IBoletinPdfGenerator (este contrato).
 * - Infrastructure: BoletinPdfGenerator lo implementa con pdf-lib.
 * - Application: el use case depende de esta interfaz (inyectada por el container),
 *   nunca de la implementación concreta.
 */
export class IBoletinPdfGenerator {
  /**
   * Genera el documento PDF del boletín de calificaciones de un estudiante.
   *
   * @param {Object} datos - Payload de un boletín (un estudiante, un paralelo/gestión).
   * @param {string} datos.titulo - Título del documento (BOLETIN DE CALIFICACIONES).
   * @param {string} datos.institucion - Nombre institucional del encabezado.
   * @param {Object} datos.cabecera - Datos del estudiante y contexto académico.
   * @param {string} datos.cabecera.estudiante - Nombre completo del estudiante.
   * @param {string} [datos.cabecera.codigoEstudiante]
   * @param {string} [datos.cabecera.ci]
   * @param {string} datos.cabecera.carrera
   * @param {string} datos.cabecera.nivel - Nivel (p. ej. "TÉCNICO SUPERIOR").
   * @param {string} datos.cabecera.curso - Periodo/curso (p. ej. "Segundo Año").
   * @param {string} datos.cabecera.paralelo - Nombre del paralelo (p. ej. "A").
   * @param {string} datos.cabecera.regimen - Régimen (p. ej. "ANUALIZADO").
   * @param {number|string} datos.cabecera.gestion - Año de gestión.
   * @param {number} [datos.notaMinimaAprobacion] - Nota mínima de aprobación.
   * @param {Array<{ codigo:string, asignatura:string, par1:(number|null),
   *                  par2:(number|null), par3:(number|null), par4:(number|null),
   *                  prom:(number|null), hab:(number|null), final:(number|null),
   *                  obs:string }>} datos.filas - Filas de la tabla de notas, una por
   *        asignatura, en orden.
   * @param {{ par1:(number|null), par2:(number|null), par3:(number|null),
   *           par4:(number|null) }} datos.promedioClasePorParcial - Promedio de la
   *        clase por parcial (fila "Promedio Anual" del pie de tabla).
   * @returns {Promise<Buffer>} Buffer del archivo .pdf.
   */
  generarBoletinEstudiante(_datos) {
    throw new Error('Method generarBoletinEstudiante must be implemented');
  }
}

export default IBoletinPdfGenerator;
