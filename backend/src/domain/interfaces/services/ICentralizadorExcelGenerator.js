/**
 * Interfaz del servicio de generación del Centralizador de Calificaciones (.xlsx).
 *
 * Contrato que debe cumplir cualquier implementación de infraestructura que arme
 * el libro Excel del centralizador a partir del payload ya formado por la capa de
 * aplicación.
 *
 * Clean Architecture:
 * - Domain: ICentralizadorExcelGenerator (este contrato).
 * - Infrastructure: CentralizadorExcelBuilder lo implementa con ExcelJS.
 * - Application: el use case depende de esta interfaz (inyectada por el container),
 *   nunca de la implementación concreta.
 *
 * Fase 1: exporta UN paralelo + UN bimestre a un libro de 1 hoja.
 * Fase 2 (no implementada aún): el mismo SheetBuilder se reutiliza para producir
 * un libro por carrera con una hoja por paralelo; por eso el shape de `datos`
 * describe una sola hoja autocontenida (cabecera + asignaturas + estudiantes).
 */
export class ICentralizadorExcelGenerator {
  /**
   * Genera el libro Excel del centralizador de un paralelo para un bimestre.
   *
   * @param {Object} datos - Payload de una hoja (un paralelo, un bimestre).
   * @param {string} datos.titulo - Título de la banda (CENTRALIZADOR DE CALIFICACIONES).
   * @param {string} datos.institucion - Subtítulo institucional.
   * @param {Object} datos.cabecera - Metadatos del paralelo (vista 87 + gestión).
   * @param {string} datos.cabecera.carrera
   * @param {string} datos.cabecera.periodo - Nombre del periodo/curso (p. ej. "Primer Año").
   * @param {string} datos.cabecera.paralelo - Nombre del paralelo (p. ej. "A").
   * @param {string} datos.cabecera.turno
   * @param {number|string} datos.cabecera.gestionAnio
   * @param {string} [datos.cabecera.gestionNombre]
   * @param {number} datos.cabecera.bimestre - 1..4 (bimestre exportado).
   * @param {string} datos.cabecera.bimestreLabel - Etiqueta visible (p. ej. "2º BIMESTRE").
   * @param {number} datos.notaMinimaAprobacion - Nota mínima de aprobación (política).
   * @param {Array<{ ofertaCursoId:number, sigla:string, nombre:string, orden:number,
   *                  docenteNombre:string }>} datos.asignaturas - Columnas, en orden.
   * @param {Array<{ nro:number, codigoEstudiante:string, ci:string,
   *                  nombreCompleto:string, estado:string, observacion:string,
   *                  celdas: Object<number, { nota:number|null, aprobado:boolean }> }>}
   *        datos.estudiantes - Filas; `celdas[ofertaCursoId]` lleva la nota del
   *        bimestre elegido y si está aprobada (nota >= notaMinimaAprobacion).
   * @returns {Promise<Buffer>} Buffer del archivo .xlsx.
   */
  generarCentralizadorParaleloBimestre(_datos) {
    throw new Error('Method generarCentralizadorParaleloBimestre must be implemented');
  }

  /**
   * Genera el libro Excel del centralizador de UNA carrera para un bimestre, con
   * una hoja por paralelo (Fase 2). Reutiliza el mismo render de hoja que la Fase 1.
   *
   * @param {Object} params
   * @param {Object} params.carrera - Metadatos de carrera para el archivo/log
   *        (p. ej. `{ nombre, bimestre, gestionAnio }`). No afecta al pintado de la
   *        hoja (cada hoja se autodescribe desde su propia `cabecera`).
   * @param {Array<{ nombreHoja: string, datos: Object }>} params.hojas - Una entrada
   *        por paralelo; `datos` tiene la MISMA forma que consume
   *        `generarCentralizadorParaleloBimestre` (cabecera + asignaturas +
   *        estudiantes). `nombreHoja` es el nombre sugerido de pestaña (se sanea y
   *        se desambigua a ≤31 chars únicos).
   * @returns {Promise<Buffer>} Buffer del archivo .xlsx multi-hoja.
   */
  generarCentralizadorCarreraBimestre(_params) {
    throw new Error('Method generarCentralizadorCarreraBimestre must be implemented');
  }
}

export default ICentralizadorExcelGenerator;
