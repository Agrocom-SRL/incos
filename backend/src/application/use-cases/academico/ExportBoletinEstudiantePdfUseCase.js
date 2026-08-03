/**
 * Exporta el Boletín de Calificaciones de UN estudiante a PDF (tamaño carta).
 *
 * Espejo del use case Excel del centralizador: REUTILIZA GetCentralizadorParaleloUseCase
 * para obtener la misma matriz que pinta la pantalla (paridad pantalla ↔ boletín) y la
 * cabecera del paralelo desde la vista 87 (carrera, periodo/curso, paralelo). El armado
 * del payload `datos` se delega al helper `construirDatosBoletinEstudiante` y el render
 * al generador inyectado (IBoletinPdfGenerator).
 *
 * Acepta `bimestre` (1..4) opcional: con él el boletín es BIMESTRAL — desglose
 * TEÓRICA + PRÁCTICA = TOTAL y ESTADO por asignatura, con el desglose leído de
 * las vistas existentes (119 unida a la 135) vía
 * `calificacionCentralizadorRepository.listarDesgloseBimestrePorEstudiante` —;
 * sin él, ANUAL (4 parciales + resumen + estado en OBSERVACIONES).
 */

import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { sanitizarFilePart } from '../../utils/centralizadorExcelDatos.js';
import { construirDatosBoletinEstudiante } from '../../utils/boletinPdfDatos.js';

export class ExportBoletinEstudiantePdfUseCase {
  constructor({
    getCentralizadorParaleloUseCase,
    parallelRepository,
    boletinPdfGenerator,
    calificacionCentralizadorRepository,
    logger
  }) {
    if (!getCentralizadorParaleloUseCase) {
      throw new Error('getCentralizadorParaleloUseCase es requerido');
    }
    if (!parallelRepository) throw new Error('parallelRepository es requerido');
    if (!boletinPdfGenerator) throw new Error('boletinPdfGenerator es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.getCentralizadorParaleloUseCase = getCentralizadorParaleloUseCase;
    this.parallelRepository = parallelRepository;
    this.boletinPdfGenerator = boletinPdfGenerator;
    // Desglose teórico/práctico del bimestre (vista 119 unida a la 135); solo lo
    // usa el boletín BIMESTRAL, por eso se valida recién en esa rama.
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.logger = logger;
  }

  /**
   * @param {{ paraleloGestionId: number|string, estudianteId: number|string,
   *           bimestre?: number|string|null }} input - `bimestre` (1..4) opcional:
   *   boletín BIMESTRAL (solo ese parcial); ausente → boletín ANUAL (sin cambios).
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ paraleloGestionId, estudianteId, bimestre = null }) {
    const pgId = Number(paraleloGestionId);
    const estId = Number(estudianteId);
    if (!Number.isFinite(pgId) || pgId < 1) {
      throw new NotFoundError('Paralelo');
    }
    if (!Number.isFinite(estId) || estId < 1) {
      throw new NotFoundError('Estudiante');
    }

    // Bimestre opcional: mismo rango 1..4 que el resto del módulo (validado
    // también en el router; aquí se blinda el use case ante llamadas internas).
    let bim = null;
    if (bimestre != null && bimestre !== '') {
      bim = Number(bimestre);
      if (!Number.isInteger(bim) || bim < 1 || bim > 4) {
        throw new ValidationError('bimestre debe ser un entero entre 1 y 4');
      }
    }

    // Matriz (misma fuente que la pantalla) + cabecera del paralelo (vista 87).
    // Boletín BIMESTRAL: además, desglose teórico/práctico del bimestre pedido.
    if (bim != null && !this.calificacionCentralizadorRepository) {
      throw new Error(
        'calificacionCentralizadorRepository es requerido para el boletín bimestral'
      );
    }
    const [matriz, cabeceraRow, desgloseBimestre] = await Promise.all([
      this.getCentralizadorParaleloUseCase.execute({ paraleloGestionId: pgId }),
      this.parallelRepository.obtenerCabeceraParaleloGestion(pgId),
      bim != null
        ? this.calificacionCentralizadorRepository.listarDesgloseBimestrePorEstudiante(
            pgId,
            estId,
            bim
          )
        : Promise.resolve(null)
    ]);

    const resultado = construirDatosBoletinEstudiante({
      matriz,
      cabeceraRow,
      estudianteId: estId,
      bimestre: bim,
      desgloseBimestre
    });
    if (!resultado) {
      throw new NotFoundError('Estudiante');
    }

    const { datos, fileNameParts } = resultado;
    const buffer = await this.boletinPdfGenerator.generarBoletinEstudiante(datos);

    const sufijoBimestre = bim != null ? `_Bimestre${bim}` : '';
    const fileName = `Boletin_${sanitizarFilePart(fileNameParts.estudiante)}_${sanitizarFilePart(
      fileNameParts.carrera
    )}_${sanitizarFilePart(fileNameParts.paralelo)}_${sanitizarFilePart(
      fileNameParts.gestion
    )}${sufijoBimestre}.pdf`;

    this.logger.info('[Calificaciones] Boletín de estudiante exportado a PDF', {
      paraleloGestionId: pgId,
      estudianteId: estId,
      bimestre: bim,
      asignaturas: datos.filas.length,
      fileName
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/pdf'
    };
  }
}

export default ExportBoletinEstudiantePdfUseCase;
