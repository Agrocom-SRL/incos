/**
 * Exporta el Avance académico a Excel — libro de 1 hoja, kit de planilla verde.
 *
 * REUTILIZA GetAvanceAcademicoUseCase (mismas filas y % que la pantalla) y
 * delega el render en el generador inyectado (IAvanceAcademicoExcelGenerator).
 * Sin alcance self: la acción EXPORTAR solo está sembrada para dirección
 * (RECTOR/DIR_ACADEMICO), que ve el listado completo.
 */

import { sanitizarFilePart } from '../../utils/centralizadorExcelDatos.js';

export class ExportAvanceAcademicoExcelUseCase {
  constructor({ getAvanceAcademicoUseCase, avanceAcademicoExcelGenerator, logger }) {
    if (!getAvanceAcademicoUseCase) {
      throw new Error('getAvanceAcademicoUseCase es requerido');
    }
    if (!avanceAcademicoExcelGenerator) {
      throw new Error('avanceAcademicoExcelGenerator es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.getAvanceAcademicoUseCase = getAvanceAcademicoUseCase;
    this.avanceAcademicoExcelGenerator = avanceAcademicoExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ carreraId?: (number|string|null) }} input
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ carreraId = null } = {}) {
    const { avance } = await this.getAvanceAcademicoUseCase.execute({ carreraId });

    const carreraFiltro = avance.length > 0 && carreraId != null ? avance[0].carreraNombre : null;
    const fechaEmision = new Date().toISOString().slice(0, 10);

    const buffer = await this.avanceAcademicoExcelGenerator.generarAvanceAcademico({
      fechaEmision,
      carreraFiltro,
      filas: avance,
    });

    const parteCarrera = carreraFiltro ? `_${sanitizarFilePart(carreraFiltro)}` : '';
    const fileName = `Avance_Academico${parteCarrera}_${sanitizarFilePart(fechaEmision)}.xlsx`;

    this.logger.info('[Académico] Avance académico exportado a Excel', {
      carreraId,
      filas: avance.length,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}

export default ExportAvanceAcademicoExcelUseCase;
