/**
 * Interfaz del generador PDF de la hoja de seguimiento de pasantía (módulo
 * TUT · pasantías). Réplica del formulario institucional real "FORMULARIO DE
 * SEGUIMIENTO DE PASANTÍA": datos del pasante, datos de la empresa, trabajo
 * realizado, principales actividades, nivel de desempeño (ALTO/MEDIO/BAJO),
 * fortalezas, áreas a mejorar, sugerencias y líneas de firma en blanco
 * (docente/empresa) — se genera EN EL MOMENTO de la descarga, no se persiste
 * archivo (patrón `ExportBitacoraMensualTutorPdfUseCase`, no
 * `pasantias_informes`: aquí no hay `ruta_archivo` que regenerar).
 */
export class IPasantiaSeguimientoPdfGenerator {
  /**
   * Genera el PDF del seguimiento y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {Object} options.pasantia - Ficha camelCase (vista 168): estudianteNombre,
   *   estudianteCi, carreraNombre, estudianteCelular, empresaNombre, empresaDireccion,
   *   empresaTelefono, areaDepartamento, responsableEmpresa, docenteSupervisorNombre,
   *   fechaInicio, fechaFinalizacion
   * @param {Object} options.seguimiento - { fecha, descripcionTrabajo, principalesActividades,
   *   nivelDesempeno, fortalezas, areasMejorar, sugerencias }
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
