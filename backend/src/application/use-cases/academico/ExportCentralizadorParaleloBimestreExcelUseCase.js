/**
 * Exporta el Centralizador de Calificaciones de UN paralelo + UN bimestre a Excel
 * (Fase 1: libro de 1 hoja).
 *
 * REUTILIZA GetCentralizadorParaleloUseCase para obtener la misma matriz que pinta
 * la pantalla (paridad pantalla ↔ Excel), y la cabecera del paralelo desde la vista
 * 87 (carrera, periodo/curso, turno, gestión). El armado del payload `datos` (nota
 * del bimestre N por asignatura + ESTADO/OBSERVACIONES) se delega al helper
 * compartido `construirDatosCentralizadorParalelo`, reutilizado también por la
 * exportación por carrera (Fase 2). Delega el render en el generador inyectado
 * (ICentralizadorExcelGenerator).
 */

import { NotFoundError } from '../../../domain/errors/AppError.js';
import {
  construirDatosCentralizadorParalelo,
  sanitizarFilePart
} from '../../utils/centralizadorExcelDatos.js';

export class ExportCentralizadorParaleloBimestreExcelUseCase {
  constructor({
    getCentralizadorParaleloUseCase,
    parallelRepository,
    centralizadorExcelGenerator,
    logger
  }) {
    if (!getCentralizadorParaleloUseCase) {
      throw new Error('getCentralizadorParaleloUseCase es requerido');
    }
    if (!parallelRepository) throw new Error('parallelRepository es requerido');
    if (!centralizadorExcelGenerator) {
      throw new Error('centralizadorExcelGenerator es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.getCentralizadorParaleloUseCase = getCentralizadorParaleloUseCase;
    this.parallelRepository = parallelRepository;
    this.centralizadorExcelGenerator = centralizadorExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ paraleloGestionId: number|string, bimestre: number|string }} input
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ paraleloGestionId, bimestre }) {
    const pgId = Number(paraleloGestionId);
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(pgId) || pgId < 1) {
      throw new NotFoundError('Paralelo');
    }
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new NotFoundError('Bimestre');
    }

    // Matriz (misma fuente que la pantalla) + cabecera del paralelo (vista 87).
    const [matriz, cabeceraRow] = await Promise.all([
      this.getCentralizadorParaleloUseCase.execute({ paraleloGestionId: pgId }),
      this.parallelRepository.obtenerCabeceraParaleloGestion(pgId)
    ]);

    const { datos, carrera, periodo, paralelo, gestionAnio } =
      construirDatosCentralizadorParalelo({ matriz, cabeceraRow, bimestre: bimestreNum });

    const buffer =
      await this.centralizadorExcelGenerator.generarCentralizadorParaleloBimestre(datos);

    const fileName = `Centralizador_${sanitizarFilePart(carrera)}_${sanitizarFilePart(
      periodo
    )}_${sanitizarFilePart(paralelo)}_Bim${bimestreNum}_${sanitizarFilePart(gestionAnio)}.xlsx`;

    this.logger.info('[Calificaciones] Centralizador exportado a Excel', {
      paraleloGestionId: pgId,
      bimestre: bimestreNum,
      estudiantes: datos.estudiantes.length,
      asignaturas: datos.asignaturas.length,
      fileName
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }
}

export default ExportCentralizadorParaleloBimestreExcelUseCase;
