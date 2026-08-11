import {
  getInformeOfPasantiaOrFail,
  getPasantiaOrFail,
} from './helpers/pasantiaGuards.js';
import { buildContextoInformePdf } from './helpers/informePdfHelpers.js';

/**
 * Use Case: ExportInformePasantiaPdfUseCase (P14)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Genera el PDF del informe EN EL MOMENTO de la descarga (no lee el archivo
 * persistido en Create/Update): así la descarga siempre refleja el formato
 * actual del generador y nunca falla si el archivo físico se perdió o el
 * servidor cambió de entorno. Valida la pertenencia informe → trámite
 * (anti-IDOR).
 */
export class ExportInformePasantiaPdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaRepository - Raíz pasantias
   * @param {Object} params.pasantiaInformeRepository - CRUD pasantias_informes
   * @param {Object} params.pasantiaViewRepository - Vista 168 (contexto del PDF)
   * @param {Object} params.pasantiaInformePdfGenerator - IPasantiaInformePdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    pasantiaRepository,
    pasantiaInformeRepository,
    pasantiaViewRepository,
    pasantiaInformePdfGenerator,
    logger,
  }) {
    this.pasantiaRepository = pasantiaRepository;
    this.pasantiaInformeRepository = pasantiaInformeRepository;
    this.pasantiaViewRepository = pasantiaViewRepository;
    this.pasantiaInformePdfGenerator = pasantiaInformePdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ pasantiaId: number, informeId: number }} input
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute({ pasantiaId, informeId } = {}) {
    const pasantia = await getPasantiaOrFail(this.pasantiaRepository, pasantiaId);
    const informe = await getInformeOfPasantiaOrFail(
      this.pasantiaInformeRepository,
      pasantiaId,
      informeId
    );

    const contexto = await buildContextoInformePdf({
      pasantiaViewRepository: this.pasantiaViewRepository,
      pasantia,
    });

    const buffer = await this.pasantiaInformePdfGenerator.generate({
      tipo: informe.tipo,
      pasantia: contexto,
      informe,
    });

    this.logger.info('[Pasantías] PDF de informe regenerado para descarga', {
      pasantiaId,
      informeId,
    });

    return {
      buffer,
      fileName: informe.nombreArchivo ?? `informe_${String(informe.tipo).toLowerCase()}_${informeId}.pdf`,
      mimeType: 'application/pdf',
    };
  }
}
