import {
  getSeguimientoOfPasantiaOrFail,
  getPasantiaOrFail,
} from './helpers/pasantiaGuards.js';
import { buildContextoInformePdf } from './helpers/informePdfHelpers.js';

/**
 * Use Case: ExportSeguimientoPasantiaPdfUseCase (extensión 2026-08-11, P16/P17)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Genera el PDF de la hoja de seguimiento EN EL MOMENTO de la descarga (no
 * hay archivo persistido para este documento — a diferencia de los informes,
 * `pasantias_seguimientos` no guarda `ruta_archivo` de esta hoja). Reutiliza
 * `buildContextoInformePdf` (genérico pese al nombre: solo arma el contexto
 * de la vista 168) y valida la pertenencia seguimiento → trámite (anti-IDOR).
 */
export class ExportSeguimientoPasantiaPdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaRepository - Raíz pasantias
   * @param {Object} params.pasantiaSeguimientoRepository - CRUD pasantias_seguimientos
   * @param {Object} params.pasantiaViewRepository - Vista 168 (contexto del PDF)
   * @param {Object} params.pasantiaSeguimientoPdfGenerator - IPasantiaSeguimientoPdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    pasantiaRepository,
    pasantiaSeguimientoRepository,
    pasantiaViewRepository,
    pasantiaSeguimientoPdfGenerator,
    logger,
  }) {
    this.pasantiaRepository = pasantiaRepository;
    this.pasantiaSeguimientoRepository = pasantiaSeguimientoRepository;
    this.pasantiaViewRepository = pasantiaViewRepository;
    this.pasantiaSeguimientoPdfGenerator = pasantiaSeguimientoPdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ pasantiaId: number, seguimientoId: number }} input
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute({ pasantiaId, seguimientoId } = {}) {
    const pasantia = await getPasantiaOrFail(this.pasantiaRepository, pasantiaId);
    const seguimiento = await getSeguimientoOfPasantiaOrFail(
      this.pasantiaSeguimientoRepository,
      pasantiaId,
      seguimientoId
    );

    const contexto = await buildContextoInformePdf({
      pasantiaViewRepository: this.pasantiaViewRepository,
      pasantia,
    });

    const buffer = await this.pasantiaSeguimientoPdfGenerator.generate({
      pasantia: contexto,
      seguimiento,
    });

    this.logger.info('[Pasantías] PDF de seguimiento generado para descarga', {
      pasantiaId,
      seguimientoId,
    });

    return {
      buffer,
      fileName: `seguimiento_pasantia_${pasantiaId}_${seguimientoId}.pdf`,
      mimeType: 'application/pdf',
    };
  }
}
