/**
 * Exporta el Consolidado % de asistencia de UN paralelo (un bimestre o el
 * acumulado anual) a Excel — libro de 1 hoja, kit de planilla verde.
 *
 * REUTILIZA GetConsolidadoAsistenciaUseCase (misma matriz que la pantalla:
 * paridad pantalla ↔ Excel) y la cabecera del paralelo desde la vista 87
 * (ParallelRepository.obtenerCabeceraParaleloGestion). Delega el render en el
 * generador inyectado (IAsistenciaConsolidadoExcelGenerator).
 */

import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { sanitizarFilePart } from '../../../utils/centralizadorExcelDatos.js';

export class ExportConsolidadoAsistenciaExcelUseCase {
  constructor({
    getConsolidadoAsistenciaUseCase,
    parallelRepository,
    asistenciaConsolidadoExcelGenerator,
    logger,
  }) {
    if (!getConsolidadoAsistenciaUseCase) {
      throw new Error('getConsolidadoAsistenciaUseCase es requerido');
    }
    if (!parallelRepository) throw new Error('parallelRepository es requerido');
    if (!asistenciaConsolidadoExcelGenerator) {
      throw new Error('asistenciaConsolidadoExcelGenerator es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.getConsolidadoAsistenciaUseCase = getConsolidadoAsistenciaUseCase;
    this.parallelRepository = parallelRepository;
    this.asistenciaConsolidadoExcelGenerator = asistenciaConsolidadoExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ paraleloGestionId: number|string, bimestre?: (number|string|null) }} input
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ paraleloGestionId, bimestre = null }) {
    // Matriz (misma fuente que la pantalla) + cabecera del paralelo (vista 87).
    const matriz = await this.getConsolidadoAsistenciaUseCase.execute({
      paraleloGestionId,
      bimestre,
    });
    const cabeceraRow = await this.parallelRepository.obtenerCabeceraParaleloGestion(
      matriz.paraleloGestionId,
    );
    if (!cabeceraRow) {
      throw new NotFoundError('Paralelo');
    }

    const bimestreLabel = matriz.bimestre != null ? `BIMESTRE ${matriz.bimestre}` : 'ANUAL';
    const datos = {
      titulo: 'CONSOLIDADO DE ASISTENCIA (%)',
      cabecera: {
        carrera: cabeceraRow.carrera_nombre ?? '',
        periodo: cabeceraRow.periodo_nombre ?? '',
        paralelo: cabeceraRow.paralelo_nombre ?? '',
        turno: cabeceraRow.turno ?? '',
        gestionAnio: matriz.gestionAnio ?? '',
        bimestreLabel,
      },
      asignaturas: matriz.asignaturas,
      estudiantes: matriz.estudiantes.map((est, idx) => ({
        nro: idx + 1,
        codigo: est.codigo,
        nombreCompleto: est.nombreCompleto,
        celdas: est.asistencia,
        promedioPct: est.promedioPct,
      })),
    };

    const buffer =
      await this.asistenciaConsolidadoExcelGenerator.generarConsolidadoAsistencia(datos);

    const parteBim = matriz.bimestre != null ? `Bim${matriz.bimestre}` : 'Anual';
    const fileName = `Consolidado_Asistencia_${sanitizarFilePart(
      cabeceraRow.carrera_nombre,
    )}_${sanitizarFilePart(cabeceraRow.periodo_nombre)}_${sanitizarFilePart(
      cabeceraRow.paralelo_nombre,
    )}_${parteBim}_${sanitizarFilePart(matriz.gestionAnio)}.xlsx`;

    this.logger.info('[Asistencia] Consolidado % exportado a Excel', {
      paraleloGestionId: matriz.paraleloGestionId,
      bimestre: matriz.bimestre,
      estudiantes: datos.estudiantes.length,
      asignaturas: datos.asignaturas.length,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}

export default ExportConsolidadoAsistenciaExcelUseCase;
