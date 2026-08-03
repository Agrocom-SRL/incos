/**
 * Exporta el reporte de Deserción estudiantil a Excel — libro de 1 hoja
 * (resumen carrera × gestión + detalle de desertores), kit de planilla verde.
 *
 * REUTILIZA GetDesercionUseCase (mismos números que la pantalla) y delega el
 * render en el generador inyectado (IDesercionExcelGenerator).
 */

import { sanitizarFilePart } from '../../utils/centralizadorExcelDatos.js';

export class ExportDesercionExcelUseCase {
  constructor({ getDesercionUseCase, desercionExcelGenerator, logger }) {
    if (!getDesercionUseCase) throw new Error('getDesercionUseCase es requerido');
    if (!desercionExcelGenerator) throw new Error('desercionExcelGenerator es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.getDesercionUseCase = getDesercionUseCase;
    this.desercionExcelGenerator = desercionExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ gestionId?: (number|string|null), carreraId?: (number|string|null) }} input
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ gestionId = null, carreraId = null } = {}) {
    const payload = await this.getDesercionUseCase.execute({ gestionId, carreraId });

    const gestionFiltro =
      payload.gestionId != null && payload.carreras.length > 0
        ? String(payload.carreras[0].gestionAnio ?? payload.carreras[0].gestionNombre ?? '')
        : null;
    const fechaEmision = new Date().toISOString().slice(0, 10);

    const buffer = await this.desercionExcelGenerator.generarReporteDesercion({
      fechaEmision,
      gestionFiltro,
      carreras: payload.carreras,
      desertores: payload.desertores,
      resumen: payload.resumen,
    });

    const parteGestion = gestionFiltro ? sanitizarFilePart(gestionFiltro) : 'Todas';
    const fileName = `Desercion_${parteGestion}_${sanitizarFilePart(fechaEmision)}.xlsx`;

    this.logger.info('[Académico] Deserción exportada a Excel', {
      gestionId: payload.gestionId,
      carreraId: payload.carreraId,
      desertores: payload.desertores.length,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}

export default ExportDesercionExcelUseCase;
