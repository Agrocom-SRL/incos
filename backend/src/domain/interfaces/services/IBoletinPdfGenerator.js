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
   * @param {string} [datos.cabecera.bimestre] - Etiqueta del bimestre (boletín
   *        bimestral, p. ej. "1º BIMESTRE"); ausente en el boletín anual.
   * @param {number} [datos.bimestre] - Bimestre (1..4) del boletín BIMESTRAL: la
   *        tabla usa el set de columnas bimestral (TEÓRICA + PRÁCTICA = TOTAL +
   *        ESTADO). Ausente → boletín anual.
   * @param {string} [datos.footerRowLabel] - Etiqueta de la fila de pie (bimestral);
   *        por defecto la de configuración ("PROMEDIO ANUAL").
   * @param {number} [datos.notaMinimaAprobacion] - Nota mínima de aprobación.
   * @param {Array<Object>} datos.filas - Filas de la tabla de notas, una por
   *        asignatura, en orden. Anual: { codigo, asignatura, par1..par4, prom,
   *        hab, final, obs } (obs = estado APROBADO/REPROBADO por asignatura).
   *        Bimestral: { codigo, asignatura, teo, pra, total, estado }.
   * @param {Object} datos.promedioClasePorParcial - Promedio de la clase para la
   *        fila de pie, con claves que calzan con las columnas: { par1..par4 }
   *        (anual) o { total } (bimestral).
   * @param {string[]} [datos.observaciones] - Observaciones del estudiante (una
   *        línea por bimestre con texto), listadas debajo de la tabla.
   * @returns {Promise<Buffer>} Buffer del archivo .pdf.
   */
  generarBoletinEstudiante(_datos) {
    throw new Error('Method generarBoletinEstudiante must be implemented');
  }
}

export default IBoletinPdfGenerator;
