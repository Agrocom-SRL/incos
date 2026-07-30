/**
 * Interfaz del servicio de generación del Libro de registro (.xlsx).
 *
 * Contrato que cumple la infraestructura que arma el libro Excel del
 * centralizador (réplica del libro físico "LIBRO LLENADO SISTEMAS 11 dic 2025"):
 * una hoja por paralelo, con los folios de ese paralelo APILADOS verticalmente
 * (bloques de cabecera + nómina de hasta 10 estudiantes + firmas).
 *
 * Clean Architecture:
 * - Domain: ILibroRegistroExcelGenerator (este contrato).
 * - Infrastructure: LibroRegistroExcelBuilder lo implementa con ExcelJS
 *   (toolkit excel/shared/: ExcelSheetComposer + ExcelTheme, banda FF196B45).
 * - Application: ExportLibroExcelUseCase depende de esta interfaz (inyectada
 *   por el container), nunca de la implementación concreta.
 */
export class ILibroRegistroExcelGenerator {
  /**
   * Genera el libro Excel completo (una hoja por paralelo, folios apilados).
   *
   * @param {Object} params
   * @param {Object} params.libro - Metadatos del libro para archivo/log:
   *        { numeroLibro, codigoRegistro, carreraNombre, gestionAnio }.
   * @param {Array<{ nombreHoja: string, folios: Array<Object> }>} params.hojas -
   *        Una entrada por paralelo. Cada folio es autocontenido:
   *        - cabecera: { codigoRegistro, numeroLibro, numeroFolio, turno,
   *          gestionAnio, carrera, curso, estado?, anulado? } (+ metadatos fijos
   *          de LIBRO_REGISTRO_DOC: institución, R.M., nivel, régimen, carácter).
   *        - asignaturas: [{ ofertaCursoId, sigla, nombre, orden }] (columnas).
   *        - estudiantes: [{ numeroOrden, nombreCompleto, ci, expedicion,
   *          estadoAcademico, observaciones, celdas: { [ofertaCursoId]: nota|'NP' } }].
   * @returns {Promise<Buffer>} Buffer del archivo .xlsx multi-hoja.
   */
  // eslint-disable-next-line no-unused-vars
  generarLibroRegistro(params) {
    throw new Error('Method generarLibroRegistro must be implemented');
  }
}

export default ILibroRegistroExcelGenerator;
