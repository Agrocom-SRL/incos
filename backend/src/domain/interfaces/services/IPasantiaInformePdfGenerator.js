/**
 * Interfaz del generador PDF de los informes de pasantía (módulo TUT ·
 * pasantías). Réplica de los formularios institucionales reales:
 * - VERIFICACION_EMPRESA: "INFORME DE VERIFICACIÓN DE LA EMPRESA Y DE SU
 *   ACTIVIDAD PARA REALIZAR LA PASANTÍA LABORAL".
 * - CONVALIDACION_TRABAJO: "INFORME DE CONVALIDACIÓN DE CERTIFICADO DE
 *   TRABAJO".
 * Estructura común: A / VIA / DE / REF / FECHA / ANTECEDENTES / RESULTADOS /
 * CONCLUSIONES / FIRMA DOCENTE. El PDF se guarda en uploads y se registra en
 * pasantias_informes (patrón dictamenes_proyecto).
 */
export class IPasantiaInformePdfGenerator {
  /**
   * Genera el PDF del informe y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {string} options.tipo - VERIFICACION_EMPRESA | CONVALIDACION_TRABAJO
   * @param {Object} options.pasantia - Ficha camelCase (vista 168): estudianteNombre,
   *   carreraNombre, gestionAnio, empresaNombre, empresaTipoSocietario, empresaNit,
   *   empresaDireccion, empresaSectorActividad, cargoPuesto, funciones, fechaInicio,
   *   tipoContrato, areaDepartamento, docenteSupervisorNombre
   * @param {Object} options.informe - { numeroMemo, fechaVerificacion, fechaEmision,
   *   evaluacionCualitativa, resultado, contenido }. "A"/"VIA" del encabezado y el
   *   área relacionada salen de constantes/pasantia.areaDepartamento, no de aquí.
   * @param {string} [options.docenteNombre] - Docente que eleva el informe
   *   (por defecto el supervisor del trámite)
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
