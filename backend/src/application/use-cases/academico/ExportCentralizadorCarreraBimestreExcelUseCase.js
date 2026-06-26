/**
 * Exporta el Centralizador de Calificaciones de UNA carrera + UN bimestre a un
 * libro Excel MULTI-HOJA (una hoja por paralelo de la carrera) — Fase 2.
 *
 * El disparo es desde la matriz P3, donde el frontend tiene `paraleloGestionId`
 * (no `carreraId`): por eso este use case recibe `{ paraleloGestionId, bimestre }`,
 * DERIVA la carrera de ese paralelo (cabecera vista 87) y luego enumera todos los
 * paralelos de esa carrera en la gestión vigente.
 *
 * REUTILIZA, por cada paralelo: GetCentralizadorParaleloUseCase (misma matriz que
 * la pantalla) + la cabecera del paralelo (vista 87) + el helper compartido
 * `construirDatosCentralizadorParalelo` (mismo armado de `datos` que la Fase 1).
 * Delega el render multi-hoja en el generador inyectado, que itera el MISMO
 * CentralizadorSheetBuilder por hoja (sin lógica de pintado nueva).
 */

import { NotFoundError } from '../../../domain/errors/AppError.js';
import {
  construirDatosCentralizadorParalelo,
  sanitizarFilePart
} from '../../utils/centralizadorExcelDatos.js';

export class ExportCentralizadorCarreraBimestreExcelUseCase {
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

    // 1) Derivar la carrera a partir del paralelo de origen (cabecera vista 87).
    const cabeceraOrigen = await this.parallelRepository.obtenerCabeceraParaleloGestion(pgId);
    const carreraId = cabeceraOrigen?.carrera_id != null ? Number(cabeceraOrigen.carrera_id) : null;
    if (!carreraId) {
      throw new NotFoundError('Carrera del paralelo');
    }
    const carreraNombre = cabeceraOrigen?.carrera_nombre ?? '';

    // 2) Enumerar los paralelos de esa carrera en la gestión vigente (vista 87).
    const paralelos =
      await this.parallelRepository.listarParalelosPorCarreraGestionVigente(carreraId);
    // Solo paralelos con matrícula (al menos un estudiante) entran al libro.
    const conMatricula = (paralelos ?? []).filter(
      (p) => Number(p.cantidad_estudiantes ?? 0) > 0
    );
    if (conMatricula.length === 0) {
      throw new NotFoundError('Paralelos con matrícula de la carrera');
    }

    // 3) Por cada paralelo: matriz + cabecera + armado de `datos` (helper compartido).
    // Secuencial para no saturar la BD (un libro de ~6-10 hojas es lo normal).
    const hojas = [];
    // El año de gestión sale de la matriz (vista 135) en el loop; la vista 87 no
    // expone gestión. Arranca vacío y se completa con el primer paralelo leído.
    let gestionAnioLibro = '';
    let totalEstudiantes = 0;
    for (const p of conMatricula) {
      const subPgId = Number(p.paralelo_gestion_id);
      // La fila de la vista 87 ya trae la cabecera del paralelo; se reusa tal cual.
      // Secuencial a propósito (no saturar la BD con un fan-out por paralelo).
      // eslint-disable-next-line no-await-in-loop
      const matriz = await this.getCentralizadorParaleloUseCase.execute({
        paraleloGestionId: subPgId
      });
      const { datos, gestionAnio } = construirDatosCentralizadorParalelo({
        matriz,
        cabeceraRow: p,
        bimestre: bimestreNum
      });
      if (gestionAnio) gestionAnioLibro = gestionAnio;
      totalEstudiantes += datos.estudiantes.length;
      hojas.push({
        nombreHoja: String(p.paralelo_nombre ?? '').trim(),
        datos
      });
    }

    const buffer = await this.centralizadorExcelGenerator.generarCentralizadorCarreraBimestre({
      carrera: { nombre: carreraNombre, bimestre: bimestreNum, gestionAnio: gestionAnioLibro },
      hojas
    });

    const fileName = `Centralizador_${sanitizarFilePart(
      carreraNombre
    )}_Bim${bimestreNum}_${sanitizarFilePart(gestionAnioLibro)}.xlsx`;

    this.logger.info('[Calificaciones] Centralizador por carrera exportado a Excel', {
      paraleloGestionOrigen: pgId,
      carreraId,
      bimestre: bimestreNum,
      hojas: hojas.length,
      estudiantes: totalEstudiantes,
      fileName
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }
}

export default ExportCentralizadorCarreraBimestreExcelUseCase;
